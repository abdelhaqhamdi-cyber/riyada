import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
أنت مهندس برمجيات خبير (Senior Software Architect) متخصص في Python, Django, Microservices, و Kubernetes.
مهمتك هي أخذ المتطلبات التقنية وتحويلها إلى خطة تنفيذية مفصلة، أكواد برمجية (Code Snippets)، وتصاميم معمارية.

القواعد:
1. الإجابة يجب أن تكون باللغة العربية بشكل أساسي، مع المصطلحات التقنية بالإنجليزية.
2. الكود يجب أن يكون نظيفاً (Clean Code) وموثقاً.
3. استخدم Markdown لتنسيق الإجابة (عناوين، قوائم، كتل برمجية).
4. عند طلب Django Models، تأكد من كتابة كود Python صحيح.
5. عند طلب API Design، وضح Endpoints, Methods, Request Body, Response.
6. فكر بعمق وتأنى قبل الإجابة لضمان تغطية جميع الجوانب (Chain of Thought).
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
        contents: prompt,
        config: config,
      });

      if (response.text) {
        return response.text;
      }
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

export const generateTechnicalSpec = async (prompt: string): Promise<string> => {
  const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n=== المتطلبات التقنية للمهمة ===\n${prompt}`;

  /* 
     Robust Strategy:
     1. Try Thinking Model (Best Quality) with retries.
     2. If completely failed, Fallback to Standard Model (Best Stability) with retries.
  */

  try {
    console.log("Starting generation sequence (Thinking Mode)...");
    return await generateWithRetry('gemini-2.5-flash', fullPrompt, {
      thinkingConfig: { 
        thinkingBudget: 1024 // Optimized budget
      },
    }, 2); // Try twice
  } catch (thinkingError: any) {
    console.warn("Thinking mode exhausted. Switching to Standard Fallback...", thinkingError.message);
    
    // If the error is clearly about Quota (429), we might want to stop early, 
    // but sometimes standard model has different quota/availability, so we try fallback unless it's 401.
    if (thinkingError.status === 401) {
       throw new Error(getFriendlyErrorMessage(thinkingError));
    }

    try {
      const result = await generateWithRetry('gemini-2.5-flash', fullPrompt, {
        temperature: 0.2,
      }, 3); // Try 3 times
      
      return result + "\n\n---\n*(ملاحظة: تم التوليد باستخدام النمط القياسي لضمان استمرارية الخدمة)*";
    } catch (fallbackError: any) {
      console.error("All generation strategies failed.", fallbackError);
      // Return the friendly error message derived from the last error
      throw new Error(getFriendlyErrorMessage(fallbackError));
    }
  }
};