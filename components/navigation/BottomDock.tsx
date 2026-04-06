"use client";

import { Home, Users, Sliders } from "lucide-react";

export type NavItem = "home" | "community" | "personalize";

interface BottomDockProps {
  activeTab: NavItem;
  onTabChange: (tab: NavItem) => void;
}

export default function BottomDock({ activeTab, onTabChange }: BottomDockProps) {
  const navItems: { id: NavItem; label: string; icon: any }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "community", label: "Community", icon: Users },
    { id: "personalize", label: "Personalize", icon: Sliders },
  ];

  const handleTabClick = (id: NavItem) => {
    onTabChange(id);
  };

  const activeIndex = navItems.findIndex(i => i.id === activeTab);

  return (
    <div className="fixed bottom-6 w-[90%] max-w-[400px] z-50 transition-all">
      {/* SHARP EDGES & DEEP SHADOW (Neo-brutalism) */}
      <div 
        className="relative flex items-center bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-sm overflow-hidden"
      >
        {/* SLIDING ANIMATION INDICATOR */}
        <div 
          className="absolute top-0 bottom-0 bg-brutal-yellow transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
          style={{ 
            width: `${100 / navItems.length}%`, 
            transform: `translateX(${activeIndex * 100}%)` 
          }}
        >
          {/* Optional: Add inner stark borders to the sliding block for more brutal feel */}
          <div className="w-full h-full border-r-[3px] border-l-[3px] border-transparent" />
        </div>

        {/* NAV ITEMS */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center gap-1.5 py-3 cursor-pointer select-none transition-all duration-200 active:scale-95 ${
                index !== 0 ? 'border-l-[3px] border-black' : ''
              }`}
            >
              <div 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}`}
              >
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 3 : 2} 
                  className={`text-black transition-colors duration-200`} 
                />
              </div>
              <span 
                className={`text-[9px] sm:text-[10px] font-heading tracking-widest uppercase transition-all duration-200 ${
                  isActive ? "text-black font-black" : "text-black/70 font-bold group-hover:text-black"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}



