import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    // Fallback to empty string or handle undefined so it doesn't crash the entire app if not configured
    aiInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });
  }
  return aiInstance;
}

export async function analyzeStraysImage(base64Image: string) {
  const ai = getAi();
  const model = "gemini-2.5-flash-lite";
  
  const prompt = "Analyze this image of a stray animal for the AASA (Aadhaar for Stray Animals) platform. Identify the species, health condition, medical urgency, and recommended immediate action.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: "You are an expert veterinarian and stray rescue coordinator. Your assessments must be concise, accurate, and prioritized by medical urgency.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            species: { type: Type.STRING, description: "Common name of the animal species (e.g., Dog, Cow, Cat)" },
            condition: { type: Type.STRING, description: "Visual description of health issues (e.g., Limping, Skin lesions, Malnourished)" },
            urgency: { 
              type: Type.STRING, 
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
              description: "Level of medical priority"
            },
            assessment: { type: Type.STRING, description: "Detailed visual diagnostics summary" },
            immediateAction: { type: Type.STRING, description: "One step the user should take immediately (e.g., Provide water, Do not approach, Call NGO)" }
          },
          required: ["species", "condition", "urgency", "assessment", "immediateAction"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e: any) {
    console.error("AI Analysis Error:", e);
    
    // Surface the actual error message to the user instead of swallowing it
    let errorMessage = e?.message || "The neural node was unable to process the biometrics.";
    try {
      const parsedError = JSON.parse(errorMessage);
      if (parsedError.error && parsedError.error.message) {
        errorMessage = parsedError.error.message;
      }
    } catch (_) {
      // Ignore if not JSON
    }
    
    return {
      species: "Unknown Entity",
      condition: "Analysis Failed",
      urgency: "MEDIUM",
      assessment: `Analysis Error: ${errorMessage}`,
      immediateAction: "Check your API key configuration and ensure the Generative Language API is enabled for your project."
    };
  }
}
