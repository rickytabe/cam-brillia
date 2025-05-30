import { useEffect, useState } from "react";
import type { Message } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeSanitize from "rehype-sanitize";
import { FaUser, FaRobot } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { useState as useReactState } from "react";
import hljs from "highlight.js";

const UserAvatar = () => (
  <div className="w-8 h-8 bg-blue-600 rounded-full sm:flex hidden items-center justify-center text-white flex-shrink-0">
    <FaUser size={18} />
  </div>
);

const AIAvatar = () => (
  <div className="w-8 h-8 bg-blue-500 rounded-full sm:flex hidden items-center justify-center text-white flex-shrink-0">
    <FaRobot size={18} />
  </div>
);

const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useReactState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 text-xs bg-white text-black px-2 py-1 rounded border border-black z-10"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

export function MessageComponent({
  content,
  isUser,
  attachments,
  displayedContent,
  isTyping,
  images,
}: Message & { isTyping?: boolean }) {
  const [attachmentImageUrls, setAttachmentImageUrls] = useState<
    (string | null)[]
  >([]);

  useEffect(() => {
    if (!attachments || attachments.length === 0) {
      setAttachmentImageUrls([]);
      return;
    }

    const newUrls = attachments.map((file) => {
      if (file.type.startsWith("image/")) {
        try {
          const blob =
            file instanceof Blob
              ? file
              : new Blob([file.data ? atob(file.data) : ""], {
                  type: file.type,
                });
          return URL.createObjectURL(blob);
        } catch (error) {
          console.error("Error creating blob URL from attachment data:", error);
          return null;
        }
      }
      return null;
    });

    setAttachmentImageUrls(newUrls);

    return () => {
      newUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [attachments]);

  const cleanMaterialDark = {
    ...materialDark,
    'pre[class*="language-"]': {
      ...materialDark['pre[class*="language-"]'],
      background: "transparent", // remove background from <pre>
    },
    'code[class*="language-"]': {
      ...materialDark['code[class*="language-"]'],
      background: "transparent", // remove background from <code>
    },
  };

  const detectLanguage = (code: string) => {
    const { language } = hljs.highlightAuto(code);
    return language || "plaintext";
  };

  return (
    <div
      className={`flex gap-4 px-4 py-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && <AIAvatar />}

      <div
        className={` rounded-xl max-w-3xl w-full md:w-auto ${
          isUser ? " p-2 bg-blue-500 text-white" : "bg-transparent text-white"
        }`}
      >
        {/* Attachments */}
        {attachments?.map((file, index) => (
          <div
            key={`attachment-${file.name}-${index}`}
            className="mb-2 last:mb-0"
          >
            {file.type.startsWith("image/") ? (
              attachmentImageUrls[index] ? (
                <img
                  src={attachmentImageUrls[index]!}
                  alt={file.name || "Attachment Image"}
                  className="w-full h-auto max-w-[90vw] md:max-w-md rounded-lg"
                />
              ) : (
                <div className="text-xs text-gray-400">Loading image...</div>
              )
            ) : (
              <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-600/50 rounded-md">
                <FiFileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="truncate text-sm" title={file.name}>
                  {file.name}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Generated Images */}
        {images?.map((imgUrl, index) => (
          <div key={`img-${index}`} className="mb-4">
            <img
              src={imgUrl}
              alt={`Generated content ${index + 1}`}
              className="w-full h-auto max-w-[90vw] md:max-w-md rounded-lg"
            />
          </div>
        ))}

        {/* Markdown Content */}
        {(displayedContent || content) && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-semibold mt-3 mb-2" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="leading-relaxed my-2 text-white/90" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-400 hover:underline break-words"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-gray-500 pl-4 ml-2 my-4 text-gray-300 italic bg-gray-700/40 rounded"
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside ml-4 my-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside ml-4 my-2" {...props} />
              ),
              li: ({ node, ...props }) => <li className="my-1" {...props} />,
              table: ({ node, ...props }) => (
                <table
                  className="table-auto border-collapse my-4 w-full text-sm text-left text-gray-300"
                  {...props}
                />
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-gray-600 text-white" {...props} />
              ),
              tbody: ({ node, ...props }) => (
                <tbody className="bg-gray-800" {...props} />
              ),
              tr: ({ node, ...props }) => (
                <tr className="border-b border-gray-700" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="px-4 py-2 font-semibold" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-4 py-2" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="text-gray-300 italic" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="text-white font-bold" {...props} />
              ),
              code({ inline, className, children }: any) {
                const codeString = String(children).replace(/\n$/, "");
                const match = /language-(\w+)/.exec(className || "");
                const lang = match?.[1] || detectLanguage(codeString); // Auto-detect if not specified

                if (!inline) {
                  return (
                    <div className="relative my-4 rounded-md overflow-hidden text-sm sm:text-xs border border-gray-700 bg-black">
                      <div className="px-4 py-1 text-xs font-mono text-gray-300 bg-gray-800 border-b border-gray-700 capitalize">
                        {lang}
                      </div>
                      <CopyButton code={codeString} />
                      <SyntaxHighlighter
                        language={lang}
                        style={cleanMaterialDark}
                        PreTag="div"
                        customStyle={{
                          background: "transparent",
                          margin: 0,
                          padding: "1rem",
                          fontSize: "inherit",
                        }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                return (
                  <code className="bg-gray-800 text-pink-300 px-1.5 py-0.5 rounded text-sm sm:text-xs">
                    {children}
                  </code>
                );
              },
            }}
          >
            {displayedContent || content}
          </ReactMarkdown>
        )}

        {/* Typing Indicator */}
        {!isUser && displayedContent?.length !== content.length && isTyping && (
          <div className="flex items-center gap-1 mt-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
      </div>

      {isUser && <UserAvatar />}
    </div>
  );
}
