import { FiImage, FiFileText } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';
import { FaBrain } from 'react-icons/fa';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

const suggestedPrompts = [
  { text: "Analyze this image for me", icon: <FiImage />, color: "from-purple-600 to-blue-500" },
  { text: "Generate an image of...", icon: <BsStars />, color: "from-pink-600 to-rose-500" },
  { text: "Explain multimodal AI", icon: <FaBrain />, color: "from-emerald-600 to-cyan-500" },
  { text: "Summarize this document", icon: <FiFileText />, color: "from-amber-600 to-orange-500" },
];

export function WelcomeScreen({ onPromptClick }: WelcomeScreenProps) {
  return (
    <div className="relative flex flex-col items-center justify-center bg-transparent overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-48 h-48 bg-gradient-radial from-white/5 to-transparent rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${15 + i * 2}s infinite linear`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 space-y-12 max-w-4xl w-full flex flex-col items-center justify-center text-center">
        
        {/* Animated header */}
        <div className="space-y-4 animate-fadeInUp">
          <h1 className="text-3xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-red-300 animate-text-gradient">
            How Can I Assist You Today?
          </h1>
          <p className="text-xl text-cyan-100/80 font-light animate-scroll">
            Choose a prompt or ask me anything
          </p>
        </div>

        {/* Interactive prompt grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt.text)}
              className={`group relative flex items-center p-6 space-x-4 bg-white/5 backdrop-blur-xl rounded-2xl transition-all
                hover:bg-white/10 hover:scale-[1.02] hover:shadow-xl border border-white/10
                ${prompt.color.replace("from", "hover:from")} hover:border-transparent`}
            >
              <span className="text-3xl text-blue-500 transform transition-transform group-hover:scale-110 flex items-center justify-center">
                {prompt.icon}
              </span>
              <span className="text-left text-lg font-medium bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                {prompt.text}
              </span>
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity ${prompt.color}" />
            </button>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(5%, -5%) scale(1.05); }
          50% { transform: translate(-5%, 5%) scale(0.95); }
          75% { transform: translate(-3%, -3%) scale(1.02); }
        }

        @keyframes text-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.5; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .animate-text-gradient {
          background-size: 300% 300%;
          animation: text-gradient 8s ease infinite;
        }

        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
