import { MODELS } from "../constants";

export function Header({ selectedModel, setSelectedModel }: {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}) {
  return (
    <header className="p-4 bg-gray-800 border-b border-gray-700">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">CAM-BRILLIANCE</h1>
        <div className="flex items-center gap-4">
          <select
            className="bg-gray-700 px-3 py-2 rounded-lg text-sm"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {Object.entries(MODELS).map(([name, value]) => (
              <option key={value} value={value}>{name}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}