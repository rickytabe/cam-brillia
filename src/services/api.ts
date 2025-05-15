import { GoogleGenAI, Modality } from "@google/genai";
import { API_KEY } from "../constants";
import type { Message } from "../types";
//import type { Message } from "../types";

export const generateResponse = async (
  prompt: string,
  attachments: File[],
  selectedModel: string,
  messages: Message[],
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
    
     // Format the conversation history
    const formattedHistory = messages.map(msg => ({
      role: msg.isUser ? "user" : "model", // Use "model" instead of "assistant"
      parts: [{ text: msg.content }]
    }));

    // Add the current prompt and attachments
    formattedHistory.push({
      role: "user",
      parts: [{ text: prompt }, ...parts.map(part => part.inlineData ? { text: `[Inline Data: ${part.inlineData.mimeType}]` } : part)]
    });
    
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedHistory,
      config: {
        responseModalities: selectedModel.toLowerCase().includes("image")
          ? [Modality.TEXT, Modality.IMAGE]
          : [Modality.TEXT],
        maxOutputTokens: 4096,
        temperature: 0.9
      },
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