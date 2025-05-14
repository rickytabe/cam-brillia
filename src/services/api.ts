import { API_KEY } from "../constants";
import type { GeminiResponse } from "../types";
import { extractPDFText } from "../Utils/pdfParser";



export const generateResponse = async (
  prompt: string,
  attachments: File[],
  selectedModel: string,
  webSearchEnabled: boolean
) => {
  try {
    const parts = [{ text: prompt }];

      for (const file of attachments) {
        if(file.type === "application/pdf") {
          const text = await extractPDFText(file);
          parts.push({ text });
        } else if (file.type.startsWith("image/")) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        parts.push({
          inline_data: {
            mime_type: file.type,
            data: base64.split(",")[1],
          },
        } as any);
      } else {
        parts.push({ text: `[Attachment: ${file.name}]` });
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.9,
          },
          tools: webSearchEnabled
            ? {
                functionCallingConfig: {
                  mode: "ANY",
                },
                googleSearchRetrieval: {
                  disableAttribution: false,
                  maxSearchResults: 5, 
                },
              }
            : undefined,
        }),
      }
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data: GeminiResponse = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("API Error:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};
