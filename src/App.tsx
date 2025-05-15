import { useState, useRef, useEffect } from "react";
import { useScrollToBottom, useFileHandling } from "./hooks";
import { MessageComponent } from "./components/Message";
import { InputArea } from "./components/InputArea";
import { generateResponse } from "./services/api";
import { MODELS } from "./constants";
import type { Message } from "./types";
import { Header } from "./components/Header";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      content: "Hello! How can I help you today?", 
      isUser: false,
      displayedContent: "Hello! How can I help you today?" 
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS.FLASH);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileHandling = useFileHandling();

  useScrollToBottom(chatEndRef, [messages]);
  
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (
      !lastMessage?.isUser &&
      lastMessage?.displayedContent?.length !== lastMessage?.content.length
    ) {
      setIsTyping(true);
      const targetContent = lastMessage.content;
      let currentIndex = lastMessage.displayedContent?.length || 0;

      const typeNextCharacter = () => {
        if (currentIndex < targetContent.length) {
          setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 
              ? { 
                  ...msg, 
                  displayedContent: targetContent.slice(0, currentIndex + 1),
                  images: msg.images // Preserve existing images
                }
              : msg
          ));
          currentIndex++;
          typingTimeout.current = setTimeout(typeNextCharacter, 30);
        } else {
          setIsTyping(false);
        }
      };

      typeNextCharacter();
    }

    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() && fileHandling.attachments.length === 0) return;

    const newMessage: Message = {
      content: input,
      isUser: true,
      attachments: [...fileHandling.attachments],
      displayedContent: input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);

    try {
      const response = await generateResponse(
        input,
        fileHandling.attachments,
        selectedModel,
        webSearchEnabled
      );

      setMessages((prev) => [
        ...prev,
        {
          content: typeof response === "string" ? response : response.text,
          images: typeof response === "object" && "images" in response ? response.images : undefined,
          isUser: false,
          displayedContent: "",
        },
      ]);
    } finally {
      setLoading(false);
      setInput("");
      fileHandling.setAttachments([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <Header
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      <main className="flex-1 overflow-y-auto p-4 mb-10">
        <div className="max-w-4xl mx-auto space-y-4 pb-24">
          {messages.map((message, index) => (
            <MessageComponent 
              key={index} 
              {...message} 
              isTyping={index === messages.length - 1 && isTyping} 
            />
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>

      <InputArea
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        loading={loading}
        attachments={fileHandling.attachments}
        setAttachments={fileHandling.setAttachments}
        webSearchEnabled={webSearchEnabled}
        setWebSearchEnabled={setWebSearchEnabled}
        fileInputRef={fileHandling.fileInputRef}
        handleFiles={fileHandling.handleFiles}
      />
    </div>
  );
}