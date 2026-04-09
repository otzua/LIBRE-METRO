"use client";

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
  const navItems: { id: NavItem; label: string; Icon: React.ElementType }[] = [
    { id: "home",        label: "HOME", Icon: Home },
    { id: "community",  label: "COMM", Icon: Users },
    { id: "personalize", label: "PERS", Icon: Sliders },
  ];

  const handleClick = (id: NavItem) => {
    if (typeof window !== "undefined" && window.navigator?.vibrate) window.navigator.vibrate(5);
    onTabChange(id);
  };

  const activeIdx = navItems.findIndex(i => i.id === activeTab);
  const totalCols  = navItems.length + 1; // 3 nav + 1 account

  const BORDER = "3px solid #000";
  const FONT   = "var(--heading-font), monospace";

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      width: "calc(100% - 32px)",
      maxWidth: 480,
      zIndex: 500,
    }}>
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 26 }}
        style={{
          display: "flex",
          background: "#fff",
          border: BORDER,
          boxShadow: "6px 6px 0 #000",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Sliding accent indicator */}
        <motion.div
          initial={false}
          animate={{ x: `${activeIdx * 100}%` }}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: `${100 / totalCols}%`,
            backgroundColor: "var(--accent, #FF2E88)",
            borderRight: BORDER,
            borderLeft: BORDER,
            zIndex: 0,
          }}
        />

        {/* Nav buttons */}
        {navItems.map((item, i) => {
          const { Icon } = item;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`dock-${item.id}`}
              onClick={() => handleClick(item.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "12px 0",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                borderLeft: i !== 0 ? BORDER : "none",
                position: "relative",
                zIndex: 10,
                userSelect: "none",
              }}
            >
              <motion.div
                animate={isActive ? { scale: 1.2, y: -1 } : { scale: 1, y: 0 }}
                whileTap={{ scale: 0.85 }}
              >
                <Icon size={16} strokeWidth={isActive ? 3 : 2} color="#000" />
              </motion.div>
              <span style={{
                fontFamily: FONT,
                fontSize: 6,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 900,
                color: "#000",
                opacity: isActive ? 1 : 0.35,
              }}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Account button — overflow visible so dropdown can escape */}
        <div style={{
          flex: 1,
          borderLeft: BORDER,
          position: "relative",
          zIndex: 10,
          background: "#fff",
          overflow: "visible",
        }}>
          <ProfileButton inDock onOpenAuth={onOpenAuth} />
        </div>
      </motion.div>
    </div>
  );
}
