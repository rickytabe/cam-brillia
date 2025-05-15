export type Message = {
  content: string;
  isUser: boolean;
  attachments?: File[];
  displayedContent?: string;
  isTyping?: boolean;
  images? : string[];
};

export interface GeminiImageResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        image?: {
          bytes: string; // Base64-encoded image
          mimeType: string;
        };
      }>;
    };
  }>;
};
