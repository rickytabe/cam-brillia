import { GoogleGenAI, Modality } from "@google/genai";
import { API_KEY } from "../constants";
import type { Message } from "../types";
import { extractPDFText } from "../Utils/pdfParser";

const convertToBase64 = (file: File): Promise<string> => 
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result.split(",")[1]); // Remove data URL prefix
    };
    reader.readAsDataURL(file);
  });

export const generateResponse = async (
  prompt: string,
  attachments: File[],
  selectedModel: string,
  messages: Message[],
  //signal: AbortSignal,
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Build conversation history
    const contents = messages.map(msg => ({
      role: msg.isUser ? "user" : "model",
      parts: [
        { text: msg.content },
        ...(msg.attachments?.map(attachment => 
          attachment.data 
            ? { inlineData: { 
                mimeType: attachment.type, 
                data: attachment.data 
              }}
            : { text: `[${attachment.type}] ${attachment.name}` }
        ) || [])
      ]
    }));

    // Process current attachments
    const currentParts = await Promise.all(attachments.map(async (file) => {
      if (file.type === "application/pdf") {
        const text = await extractPDFText(file);
        return { text: `[PDF] ${text.substring(0, 1000)}...` };
      }
      if (file.type.startsWith("image/")) {
        const data = await convertToBase64(file);
        return { inlineData: { mimeType: file.type, data } };
      }
      return { text: `[${file.type}] ${file.name}` };
    }));

    // Add current message
    contents.push({
      role: "user",
      parts: [
        { text: prompt },
        ...currentParts
      ]
    });

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        responseModalities: selectedModel.toLowerCase().includes("image")
          ? [Modality.TEXT, Modality.IMAGE]
          : [Modality.TEXT],
          maxOutputTokens: 100000,
          temperature: 1
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

const parseGeminiResponse = (response:any) => {
  if (!response.candidates?.[0]?.content?.parts) {
    return { text: "No valid response generated", images: [] };
  }

  return response.candidates[0].content.parts.reduce((acc:any, part: any) => ({
    text: acc.text + (part.text || ""),
    images: [
      ...acc.images,
      ...(part.inlineData ? [
        `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
      ] : [])
    ]
  }), { text: "", images: [] as string[] });
};