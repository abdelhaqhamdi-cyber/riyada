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
6. فكر بعمق قبل الإجابة (Chain of Thought) لضمان تغطية جميع جوانب البنية التحتية.
`;

export const generateTechnicalSpec = async (prompt: string): Promise<string> => {
  // Merge system instruction into the prompt to ensure it's always processed correctly
  // irrespective of API config nuances.
  const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n=== المتطلبات التقنية للمهمة ===\n${prompt}`;

  let lastError: any;

  // Retry logic: Attempt up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded to Pro model for complex architectural tasks
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }], // Explicit content structure
        config: {
          temperature: 0.2,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn(`Gemini generation attempt ${attempt} failed:`, error);
      lastError = error;
      // Exponential backoff: 1s, 2s, then fail
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  // If we get here, all retries failed
  const errorMessage = lastError instanceof Error ? lastError.message : JSON.stringify(lastError);
  throw new Error(errorMessage || "فشل الاتصال بـ Gemini API بعد عدة محاولات.");
};