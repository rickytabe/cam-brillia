import { useRef, useEffect } from "react";

export function InputArea({
  input,
  setInput,
  handleSend,
  loading,
  attachments,
  setAttachments,
  webSearchEnabled,
  setWebSearchEnabled,
  fileInputRef,
  handleFiles,
  onStopGeneration,
}: {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  loading: boolean;
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (value: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFiles: (files: FileList) => void;
  onStopGeneration: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      // Limit maximum height to 200px (adjust as needed)
      if (textareaRef.current.scrollHeight > 200) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [input]);

  return (
    <div className="fixed bottom-0 w-full md:w-3/4 lg:w-1/2 md:mb-2 bg-gray-800 border-t border-gray-700 rounded-4xl">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-1">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-4xl ${
              webSearchEnabled ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Web Search
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <button
            className="p-2 text-gray-300 hover:text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {attachments.map((file, index) => (
            <div key={index} className="relative bg-gray-700 p-2 rounded-lg">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{file.name}</span>
                </div>
              )}
              <button
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, i) => i !== index))
                }
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1 p-3 bg-transparent rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-transparent custom-scrollbar"
            placeholder="Type your message..."
            rows={1}
            style={{
              minHeight: "44px",
              maxHeight: "200px",
              transition: "height 0.2s ease-out",
            }}
          />

           <div className="flex items-center">
            <button
              onClick={handleSend}
              disabled={loading || (!input.trim() && attachments.length === 0)}
              className="p-3 bg-blue-500 rounded-4xl hover:bg-blue-600 disabled:bg-gray-600 transition-colors flex items-center justify-center"
              style={{ width: '44px', height: '44px' }} 
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    className="opacity-75"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
            {loading && (
              <button
                onClick={onStopGeneration}
                className="p-3 bg-red-500 rounded-4xl hover:bg-red-600 transition-colors ml-2 flex items-center justify-center"
                title="Stop Generation"
                style={{ width: '44px', height: '44px' }} 
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
