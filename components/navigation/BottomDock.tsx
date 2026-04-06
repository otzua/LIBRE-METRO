import { Home, Users, Sliders } from "lucide-react";
import { motion } from "framer-motion";
import ProfileButton from "@/components/auth/ProfileButton";

export type NavItem = "home" | "community" | "personalize";

interface BottomDockProps {
  activeTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  onOpenAuth: () => void;
}

export default function BottomDock({ activeTab, onTabChange, onOpenAuth }: BottomDockProps) {
  const navItems: { id: NavItem; label: string; icon: any }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "community", label: "Community", icon: Users },
    { id: "personalize", label: "Personalize", icon: Sliders },
  ];

  const handleTabClick = (id: NavItem) => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
    onTabChange(id);
  };

  const activeIndex = navItems.findIndex(i => i.id === activeTab);
  const totalGridItems = navItems.length + 1;

  return (
    <div className="fixed bottom-6 w-[95%] max-w-[480px] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative flex items-center bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-sm overflow-visible pointer-events-auto"
      >
        {/* SLIDING INDICATOR - FRAMER MOTION */}
        <motion.div 
          className="absolute top-0 bottom-0 bg-brutal-yellow z-0"
          initial={false}
          animate={{ x: `${activeIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          style={{ width: `${100 / totalGridItems}%` }}
        >
          <div className="w-full h-full border-r-[3px] border-l-[3px] border-transparent" />
        </motion.div>

        {/* NAV ITEMS */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center gap-1 py-3 cursor-pointer select-none transition-colors duration-200 active:brightness-95 group ${
                index !== 0 ? 'border-l-[3px] border-black/10' : ''
              }`}
            >
              <motion.div 
                animate={isActive ? { scale: 1.25, y: -2 } : { scale: 1, y: 0 }}
                whileHover={{ scale: 1.15, y: -1 }}
                whileTap={{ scale: 0.9 }}
                className="relative flex flex-col items-center"
              >
                <Icon 
                  size={18} 
                  strokeWidth={isActive ? 3 : 2.5} 
                  className="text-black" 
                />
              </motion.div>
              <span 
                className={`text-[8px] font-heading tracking-[0.1em] uppercase transition-all duration-200 ${
                  isActive ? "text-black font-black" : "text-black/60 font-bold"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* ACCOUNT BUTTON IN DOCK */}
        <div className="flex-1 flex border-l-[3px] border-black items-center justify-center relative z-10 bg-white">
          <ProfileButton inDock onOpenAuth={onOpenAuth} />
        </div>
      </motion.div>
    </div>
  );
}



