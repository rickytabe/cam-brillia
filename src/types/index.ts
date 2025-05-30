
export type Message = {
  content: string;
  isUser: boolean;
  attachments?: Array<{
    name: string;
    type: string;
    data?: string; // Base64 data without prefix
  }>;
  displayedContent?: string;
  images?: string[];
};

export type GeminiResponse = {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    groundingMetadata?: {
      webSearchQueries?: string[];
      searchResults?: Array<{
        url: string;
        title: string;
        snippet: string;
      }>;
    };
  }>;
};


export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  selectedModel:string;
  createdAt: number; // Timestamp for sorting or display
}