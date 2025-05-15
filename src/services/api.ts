import { GoogleGenAI, Modality } from "@google/genai";
import { API_KEY } from "../constants";
import type { Message } from "../types";

export const generateResponse = async (
  prompt: string,
  attachments: File[],
  selectedModel: string,
  webSearchEnabled: boolean
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Process attachments
    const parts = await Promise.all(attachments.map(async (file) => {
      if (file.type.startsWith("image/")) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        return {
          inlineData: {
            mimeType: file.type,
            data: base64.split(",")[1]
          }
        };
      }
      return { text: `[Attachment: ${file.name}]` };
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [
        { 
          role: "user",
          parts: [
            { text: prompt },
            ...parts
          ]
        }
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.9
        }
      },
      tools: webSearchEnabled ? [{
        googleSearchRetrieval: {
          disableAttribution: false,
          maxSearchResults: 5
        }
      }] : undefined
    });

    return parseGeminiResponse(response);

  } catch (error) {
    console.error("API Error:", error);
    return {
      text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      images: []
    };
  }
};

const parseGeminiResponse = (response: any) => {
  if (!response.candidates?.[0]?.content?.parts) {
    return { text: "No valid response generated", images: [] };
  }

  return response.candidates[0].content.parts.reduce((acc: any, part: any) => ({
    text: acc.text + (part.text || ""),
    images: [
      ...acc.images,
      ...(part.inlineData ? [
        `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
      ] : [])
    ]
  }), { text: "", images: [] });
};