"use client";

import { useEffect, useState } from "react";

interface CommunityModalProps {
  onClose: () => void;
}

export default function CommunityModal({ onClose }: CommunityModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    
    // ESC key support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}>
      <div 
        className={`w-full max-w-sm mx-4 bg-[#111827] border-2 border-white shadow-neo-lg p-8 transition-transform duration-300 transform flex flex-col items-center gap-6 ${isAnimating ? "scale-100" : "scale-95"}`}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            COMMUNITY
          </h2>
          <p className="text-white/60 font-medium">
            Coming soon...
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-brutal-yellow font-heading font-black text-black border-2 border-transparent py-4 shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer uppercase tracking-widest mt-4"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
