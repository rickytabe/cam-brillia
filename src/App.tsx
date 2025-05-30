import { useState, useRef, useEffect } from "react";
import { useScrollToBottom, useFileHandling } from "./hooks";
import { MessageComponent } from "./components/Message";
import { InputArea } from "./components/InputArea";
import { generateResponse } from "./services/api";
import { MODELS } from "./constants";
import type { Message, ChatSession } from "./types";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Header } from "./components/Header";
import { ChatSidebar } from "./components/ChatSideBar";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS.FLASH);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileHandling = useFileHandling();

  useEffect(() => {
    localStorage.setItem(
      "sidebarCollapsed",
      JSON.stringify(isSidebarCollapsed)
    );
  }, [isSidebarCollapsed]);

  //useScrollToBottom(chatEndRef, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

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
          if (!loading) setLoading(true);
          setMessages((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? {
                    ...msg,
                    displayedContent: targetContent.slice(0, currentIndex + 1),
                    images: msg.images,
                  }
                : msg
            )
          );
          currentIndex++;
          typingTimeout.current = setTimeout(typeNextCharacter, 30);
        } else {
          setIsTyping(false);
          setLoading(false);
        }
      };
      typeNextCharacter();
    } else if (
      lastMessage?.isUser ||
      (lastMessage &&
        lastMessage?.displayedContent?.length === lastMessage?.content.length)
    ) {
      if (isTyping) setIsTyping(false);
      if (loading && !abortControllerRef.current) {
        const aiMessageFullyTyped =
          !lastMessage?.isUser &&
          lastMessage?.displayedContent?.length === lastMessage?.content.length;
        if (lastMessage?.isUser || aiMessageFullyTyped) {
          setLoading(false);
        }
      }
    }

    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [messages, loading, isTyping, setLoading]);

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat ${chatSessions.length + 1}`,
      createdAt: Date.now(),
      messages: [],
      selectedModel: selectedModel,
    };
    setChatSessions([newSession, ...chatSessions]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleSwitchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // Here you would typically load the messages for this session
    setIsSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() && fileHandling.attachments.length === 0) return;
    setError(null);
    abortControllerRef.current = new AbortController();

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
        messages,
        abortControllerRef.current.signal
      );

      setMessages((prev) => [
        ...prev,
        {
          content: typeof response === "string" ? response : response.text,
          images:
            typeof response === "object" && "images" in response
              ? response.images
              : undefined,
          isUser: false,
          displayedContent: "",
        },
      ]);
      setInput("");
      fileHandling.setAttachments([]);
    } catch (error: any) {
      console.error("Error Message:", error);
      if ((error as Error).name === "AbortError") {
        console.log("Fetch aborted by user action or network issue.");
        if (!isTyping) {
          handleStopGeneration();
        }
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again."
        );
        setLoading(false);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    setIsTyping(false);
    setLoading(false);

    setMessages((prev) => {
      const lastMsgIndex = prev.length - 1;
      if (
        lastMsgIndex >= 0 &&
        !prev[lastMsgIndex].isUser &&
        !(
          prev[lastMsgIndex].content.endsWith("(Stopped)") &&
          prev[lastMsgIndex].displayedContent?.endsWith("(Stopped)")
        )
      ) {
        return prev.map((msg, index) =>
          index === lastMsgIndex
            ? {
                ...msg,
                content:
                  (msg.displayedContent || msg.content || "") + " (Stopped)",
                displayedContent:
                  (msg.displayedContent || msg.content || "") + " (Stopped)",
              }
            : msg
        );
      }
      return prev;
    });
  };

  const handleSuggestedPromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed md:relative z-20 h-full bg-gray-800 transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          isSidebarCollapsed ? "w-20 md:w-20" : "w-64 md:w-64"
        } border-r border-gray-700`}
      >
         <ChatSidebar
          sessions={chatSessions}
          currentSessionId={currentSessionId}
          onSwitchSession={handleSwitchSession}
          onNewSession={handleNewSession}
          selectedModel={selectedModel}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 mb-10 relative">
          <div className="max-w-4xl mx-auto space-y-4 pb-24">
            {messages.filter((msg) => msg.isUser || msg.content).length ===
            0 ? (
              <WelcomeScreen onPromptClick={handleSuggestedPromptClick} />
            ) : (
              messages.map((message, index) => (
                <MessageComponent
                  key={index}
                  {...message}
                  isTyping={
                    index === messages.length - 1 && isTyping && !message.isUser
                  }
                />
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </main>

        {error && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-20 p-3 bg-red-500 text-white rounded-md shadow-lg w-auto max-w-md text-center">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex justify-center items-center mb-2 relative z-10">
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
            onStopGeneration={handleStopGeneration}
          />
        </div>
      </div>
    </div>
  );
}
