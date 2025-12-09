import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
أنت مهندس برمجيات خبير (Senior Software Architect) ومطور ويب شامل.
مهمتك هي كتابة مواصفات تقنية وأكواد قابلة للتنفيذ المباشر.

=== 1. قواعد السياق (Project Context) ===
ستتلقى في الطلب قسماً بعنوان "سياق المشروع الحالي". يحتوي هذا على ملخصات أو أكواد من مهام سابقة تم إنجازها.
- **يجب** عليك احترام القرارات التقنية المتخذة سابقاً (مثلاً: إذا تم اختيار PostgreSQL في مهمة سابقة، لا تستخدم MongoDB الآن).
- ابني على ما تم إنجازه ولا تكرر الأساسيات إلا إذا طُلب منك.

=== 2. قواعد المخططات البيانية (Visuals & Diagrams) ===
عندما يتطلب الطلب تصميماً للبنية (Architecture) أو قاعدة البيانات (Database) أو تدفق العمليات (Flow):
- **يجب دائماً** إرفاق مخططات بصرية باستخدام **Mermaid.js**.
- استخدم \`graph TD\` للهيكلية العامة.
- استخدم \`erDiagram\` لتصاميم قواعد البيانات والعلاقات.
- استخدم \`sequenceDiagram\` لتدفق العمليات المعقدة.
- ضع كود المخطط داخل كتلة كود: \`\`\`mermaid

=== 3. قواعد نظام الملفات (File System Protocol) ===
لتمكين النظام من "تنفيذ" إجاباتك وتحويلها إلى ملفات حقيقية، اتبع التالي:
- يجب أن يبدأ كل مربع كود برمجي (غير Mermaid) بتعليق يحدد المسار: \`// filename: path/to/file\`
- اجعل الكود كاملاً وجاهزاً للعمل.

هدفنا: بناء مشروع متكامل، متسق، وموثق بشكل احترافي مع التركيز على التوضيح البصري.
`;

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to map raw API errors to user-friendly Arabic messages
 */
const getFriendlyErrorMessage = (error: any): string => {
  const msg = (error.message || error.toString()).toLowerCase();
  const status = error.status;

  if (msg.includes('401') || msg.includes('api key') || status === 401) {
    return "مفتاح API غير صالح أو مفقود (Invalid API Key). يرجى التحقق من الإعدادات.";
  }
  
  if (msg.includes('429') || msg.includes('quota') || msg.includes('resource exhausted') || status === 429) {
    return "تم تجاوز حد الاستخدام المسموح (Rate Limit Exceeded). يرجى الانتظار قليلاً قبل المحاولة.";
  }
  
  if (msg.includes('503') || msg.includes('overloaded') || msg.includes('service unavailable') || status === 503) {
    return "خوادم الذكاء الاصطناعي مشغولة جداً حالياً (Model Overloaded). يرجى المحاولة بعد دقيقة.";
  }

  if (msg.includes('safety') || msg.includes('blocked')) {
    return "تم حجب الاستجابة بسبب معايير السلامة (Safety Filters). حاول تعديل صياغة الطلب.";
  }
  
  if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('connection')) {
    return "فشل الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت لديك.";
  }

  return `حدث خطأ تقني غير متوقع: ${msg}`;
};

/**
 * Generic function to attempt generation with retries.
 */
async function generateWithRetry(
  model: string, 
  prompt: string, 
  config: any, 
  maxRetries: number = 3
): Promise<string> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) console.log(`Attempt ${attempt}/${maxRetries} for model ${model}...`);
      
      const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: config,
      });

      if (response.text) {
        return response.text;
      }
      throw new Error("Received an empty response from the API.");
    } catch (error: any) {
      console.warn(`Attempt ${attempt} failed for ${model}:`, error.message);
      lastError = error;
      
      // Stop retrying immediately if it's a client error (4xx) that isn't Quota related (429)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s
      if (attempt < maxRetries) {
        const waitTime = 2000 * Math.pow(2, attempt - 1);
        await delay(waitTime);
      }
    }
  }
  
  throw lastError || new Error(`Failed to generate content with ${model} after ${maxRetries} attempts.`);
}

export const generateTechnicalSpec = async (prompt: string, projectContext: string = ""): Promise<string> => {
  // Inject context into the user prompt
  let finalPrompt = `=== المتطلبات التقنية للمهمة الحالية ===\n${prompt}\n\n`;
  
  if (projectContext) {
    finalPrompt += `=== سياق المشروع (مهام مكتملة سابقاً) ===\nاستخدم المعلومات التالية لضمان الاتساق (لا تكررها، بل ابنِ عليها):\n${projectContext}\n\n`;
  }

  try {
    console.log("Starting generation sequence (Thinking Mode)...");
    return await generateWithRetry('gemini-2.5-flash', finalPrompt, {
      systemInstruction: SYSTEM_INSTRUCTION, 
      thinkingConfig: { 
        thinkingBudget: 2048 
      },
    }, 2); 
  } catch (thinkingError: any) {
    console.warn("Thinking mode exhausted. Switching to Standard Fallback...", thinkingError.message);
    
    if (thinkingError.status === 401) {
       throw new Error(getFriendlyErrorMessage(thinkingError));
    }

    try {
      const result = await generateWithRetry('gemini-2.5-flash', finalPrompt, {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      }, 3); 
      
      return result + "\n\n---\n*(ملاحظة: تم التوليد باستخدام النمط القياسي لضمان استمرارية الخدمة)*";
    } catch (fallbackError: any) {
      console.error("All generation strategies failed.", fallbackError);
      throw new Error(getFriendlyErrorMessage(fallbackError));
    }
  }
};