import { MODELS } from "../constants";

export function Header({
  selectedModel,
  setSelectedModel,
  onToggleSidebar,
}: {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onToggleSidebar: () => void;
}) {
  const modelDisplayName = (modelValue: string) => {
    const entry = Object.entries(MODELS).find(
      ([_, value]) => value === modelValue
    );
    return entry
      ? entry[0].charAt(0) + entry[0].slice(1).toLowerCase()
      : "Unknown Model";
  };

  return (
    <header className="w-full mx-auto p-4 bg-gray-900 border-b border-gray-800">
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="mr-3 p-1 text-gray-300 hover:text-white focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-white">CamBrilliance AI</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-white text-sm hidden md:inline">
            Model: {modelDisplayName(selectedModel)}
          </span>
          <select
            className="bg-gray-700 px-3 py-2 rounded-lg text-sm text-white border border-gray-600 focus:border-indigo-500 focus:outline-none"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {Object.entries(MODELS).map(([name, value]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}