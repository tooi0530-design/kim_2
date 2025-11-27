import { GoogleGenAI } from "@google/genai";

// API 키가 없을 경우를 대비해 안전하게 초기화합니다.
// vite.config.ts에서 define 설정을 통해 process.env.API_KEY가 문자열로 대체됩니다.
const apiKey = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Gemini 클라이언트 초기화 실패:", e);
  }
}

export const getAiAdvice = async (
  goal: string,
  mood: string,
  dayNumber: number,
  journalContent: string
): Promise<string> => {
  if (!ai) {
    return "API 키가 설정되지 않았습니다. Vercel 환경 변수에서 API_KEY를 설정해주세요.";
  }

  try {
    const prompt = `
      You are a warm, supportive self-care coach.
      The user is on day ${dayNumber} of their 100-day self-care journey.
      
      Their main goal is: "${goal || 'To take better care of myself'}".
      Their current mood is: "${mood}".
      They wrote this in their journal: "${journalContent || '(No entry yet)'}".

      Please provide a short, encouraging message (max 2-3 sentences) and ONE simple, actionable self-care tip relevant to their mood and goal today.
      Reply in Korean (warm, polite tone, '해요' style).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "잠시 후 다시 시도해주세요.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "지금은 AI 조언을 가져올 수 없어요. 잠시 후 다시 시도해주세요.";
  }
};