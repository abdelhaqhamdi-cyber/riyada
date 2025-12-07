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
`;

export const generateTechnicalSpec = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for precise technical output
      },
    });

    return response.text || "عذراً، لم أتمكن من توليد المحتوى. يرجى المحاولة مرة أخرى.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("حدث خطأ أثناء الاتصال بـ Gemini API");
  }
};
