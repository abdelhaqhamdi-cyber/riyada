

import { GoogleGenAI, Type } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
أنت مهندس حلول رئيسي وقائد تطوير نخبوي (Principal Solutions Architect & Elite Development Lead).
مهمتك هي ترجمة المتطلبات إلى نظام برمجي متكامل، جاهز للإنتاج، وموثق بأعلى المعايير الاحترافية.

=== القاعدة الذهبية: الجاهزية للإنتاج ===
كل مخرجاتك يجب أن تكون جاهزة للإنتاج (Production-Ready). أنت لا تقوم بكتابة مسودات، بل تقوم ببناء المنتج النهائي مباشرة. الدقة، الاكتمال، والالتزام بأفضل الممارسات هي أمور غير قابلة للتفاوض.

=== 1. بروتوكول الاتساق (Consistency Protocol) ===
ستتلقى سياقاً للمهام المنجزة سابقاً.
- **الالتزام المطلق:** يجب عليك احترام القرارات التقنية السابقة (لغات البرمجة، قواعد البيانات، الأنماط المعمارية) لضمان اتساق المشروع.
- **البناء التراكمي:** لا تكرر الأكواد الأساسية، بل افترض وجودها وقم بالبناء عليها.

=== 2. التزام التوضيح البصري (Visual Clarity Mandate) ===
عند تصميم أي بنية (Architecture)، قاعدة بيانات (Database)، أو تدفق (Flow):
- **إلزامي:** استخدم **Mermaid.js** لإنشاء مخططات بصرية واضحة.
- استخدم المخطط المناسب للمهمة: \`graph TD\` للهياكل، \`erDiagram\` للبيانات، \`sequenceDiagram\` للتفاعلات.
- يجب وضع كود المخطط داخل كتلة كود محددة: \`\`\`mermaid

=== 3. بروتوكول نظام الملفات للتنفيذ الآلي (Automated Execution Protocol) ===
لتمكين التنفيذ الآلي لمخرجاتك، اتبع هذا البروتوكول بدقة:
- **تحديد المسار إلزامي:** يجب أن يبدأ كل مربع كود برمجي (غير Mermaid) بتعليق يحدد المسار الكامل والملف: \`// filename: path/to/your/file.ext\`
- **الكود الكامل:** يجب أن يكون الكود كاملاً، قابلاً للترجمة (compilable)، وجاهزاً للتشغيل دون تعديل.

هدفنا النهائي: إنشاء نظام برمجي احترافي، متكامل، وموثق بشكل لا تشوبه شائة.
`;

const CHECKLIST_SYSTEM_INSTRUCTION = `
أنت مدير مشاريع تقنية خبير (Expert Technical Project Manager).
مهمتك هي تحليل متطلبات وهدف مهمة معينة، ثم تقسيمها إلى قائمة مراجعة (checklist) دقيقة وقابلة للتنفيذ.
- يجب أن تكون كل نقطة في القائمة واضحة ومحددة.
- ركز على المخرجات التقنية المطلوبة (e.g., "Create API endpoint for user registration", "Design database schema for products").
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
  
  if (msg.includes('quota') || msg.includes('429') || msg.includes('resource exhausted') || status === 429) {
    return "لقد تجاوزت الحصة المخصصة لك (Quota Exceeded). هذا يعني أنك قمت بعدد كبير من الطلبات في فترة قصيرة. يرجى الانتظار بضع دقائق ثم المحاولة مرة أخرى.";
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
        // FIX: The `contents` parameter should be a string for single-turn text prompts.
        contents: prompt,
        config: config,
      });

      if (response.text) {
        return response.text;
      }
      throw new Error("Received an empty response from the API.");
    } catch (error: any) {
      console.warn(`Attempt ${attempt} failed for ${model}:`, error.message);
      lastError = error;
      
      // Do not retry on client-side errors like invalid API key
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      if (attempt < maxRetries) {
        // Exponential backoff
        const waitTime = 1000 * Math.pow(2, attempt);
        await delay(waitTime);
      }
    }
  }
  
  throw lastError || new Error(`Failed to generate content with ${model} after ${maxRetries} attempts.`);
}

export const generateTechnicalSpec = async (prompt: string, projectContext: string = "", checklist: string = ""): Promise<string> => {
  let finalPrompt = `=== المتطلبات التقنية للمهمة الحالية ===\n${prompt}\n\n`;
  
  if (checklist) {
    finalPrompt += `=== قائمة المراجعة (معايير القبول) ===\n**يجب** الالتزام بتنفيذ جميع هذه النقاط:\n${checklist}\n\n`;
  }

  if (projectContext) {
    finalPrompt += `=== سياق المشروع (مهام مكتملة سابقاً) ===\nاستخدم المعلومات التالية لضمان الاتساق (لا تكررها، بل ابنِ عليها):\n${projectContext}\n\n`;
  }

  try {
    return await generateWithRetry('gemini-3-pro-preview', finalPrompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      // Using a slightly more capable model for primary generation
    }, 3);
  } catch (error: any) {
    console.error("Primary generation failed. All retries exhausted.", error);
    // This is the final point of failure, so we must throw the user-friendly message.
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const generateChecklist = async (prompt: string, goal: string): Promise<string[]> => {
    const finalPrompt = `
    الرجاء إنشاء قائمة مراجعة للمهمة التالية:
    - **المتطلبات (Prompt):** ${prompt}
    - **الهدف (Goal):** ${goal}
    `;
    
    try {
        const responseText = await generateWithRetry('gemini-2.5-flash', finalPrompt, {
            systemInstruction: CHECKLIST_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'A single, actionable checklist item.'
              }
            },
            temperature: 0.1,
        }, 3);

        // Clean the response to ensure it's valid JSON, though schema should make it clean
        const cleanedText = responseText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedText);

        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
            return parsed;
        } else {
            throw new Error("Invalid JSON format for checklist");
        }
    } catch (error: any) {
        console.error("Failed to generate or parse checklist:", error);
        throw new Error("لم يتمكن الذكاء الاصطناعي من توليد قائمة مراجعة صالحة. حاول مرة أخرى أو قم بإضافتها يدوياً.");
    }
};