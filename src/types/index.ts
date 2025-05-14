export type Message = {
  content: string;
  isUser: boolean;
  attachments?: File[];
  displayedContent?: string;
  isTyping?: boolean;
};

export type GeminiResponse = {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
};
