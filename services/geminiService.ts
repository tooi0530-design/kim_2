import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiAdvice = async (
  goal: string,
  mood: string,
  dayNumber: number,
  journalContent: string
): Promise<string> => {
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
