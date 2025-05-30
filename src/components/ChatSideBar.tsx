import React from "react";
import type { ChatSession } from "../types";
import {
  FiDownload,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronDown,
} from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSwitchSession: (sessionId: string) => void;
  onNewSession: () => void;
  selectedModel?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSwitchSession,
  onNewSession,
  //selectedModel = "Default",
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <div className="w-full h-full flex flex-col p-4 space-y-4">
      <div className="flex items-center justify-between w-full mb-4">
        {isCollapsed ? (
          <button
            className="text-2xl font-bold text-gray-100 mb-4 w-full"
            onClick={onToggleCollapse}
          >
            <img src="../../src/assets/logo.png" alt="Brillia AI Logo" className="h-12 w-12" />
          </button>
        ) : (
          <h1 className="text-2xl font-bold text-gray-100 mb-4">Brillia AI</h1>
        )}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
          >
            <FiChevronLeft className="text-gray-400" />
          </button>
        )}
      </div>

      <button
        onClick={onNewSession}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-0 rounded-lg transition duration-200 flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        {!isCollapsed && "New Chat"}
      </button>

      {!isCollapsed && (
        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold px-2">
          Recent Chats
        </div>
      )}

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {sessions.map((session) => (
            <li key={session.id}>
              <button
                onClick={() => onSwitchSession(session.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors truncate flex items-center
                  ${
                    session.id === currentSessionId
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                {!isCollapsed && (
                  <span className="truncate">
                    {session.name || `Chat ${session.id.substring(0, 6)}`}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto space-y-4">
        <div className="bg-indigo-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-indigo-400">
            <FiDownload className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Get Mobile App</span>}
          </div>
        </div>

        <div className="relative group">
          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <FaUserCircle className="h-8 w-8 text-gray-400" />
            {!isCollapsed && (
              <>
                <span className="text-sm text-gray-200 truncate">
                  guest@example.com
                </span>
                <FiChevronDown className="ml-auto opacity-70" />
              </>
            )}
          </button>

          <div
            className={`hidden group-hover:block absolute bottom-full left-0 w-full bg-gray-800 rounded-lg shadow-lg p-2 mb-2 ${
              isCollapsed ? "-left-24" : ""
            }`}
          >
            <button className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md text-sm">
              <FiSettings className="text-gray-300" />
              {!isCollapsed && "Settings"}
            </button>
            <button className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md text-sm">
              <FiLogOut className="text-gray-300" />
              {!isCollapsed && "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
