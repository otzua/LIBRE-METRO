"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Theme = "pink" | "yellow" | "blue";

const THEMES: { id: Theme; label: string; accent: string; bg: string }[] = [
  { id: "pink",   label: "PINK",   accent: "#FF2E88", bg: "#FFFEF0" },
  { id: "yellow", label: "YELLOW", accent: "#FACC00", bg: "#FFFFF0" },
  { id: "blue",   label: "BLUE",   accent: "#4DA3FF", bg: "#EEF4FF" },
];

function applyTheme(theme: Theme) {
  const t = THEMES.find(x => x.id === theme)!;
  const root = document.documentElement;

  // 1. Remove old class, add new
  root.classList.remove("theme-pink", "theme-yellow", "theme-blue");
  root.classList.add(`theme-${theme}`);

  // 2. Directly set CSS variables AND background (belt + suspenders)
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--dot", t.accent);
  root.style.backgroundColor = t.bg;

  localStorage.setItem("libre-metro-theme", theme);
}

export default function ThemeToggle() {
  const [active, setActive]   = useState<Theme>("pink");
  const [open,   setOpen]     = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("libre-metro-theme") as Theme;
    const init  = saved && ["pink","yellow","blue"].includes(saved) ? saved : "pink";
    setActive(init);
    applyTheme(init);
    setMounted(true);
  }, []);

  const select = (theme: Theme) => {
    setActive(theme);
    applyTheme(theme);
    setOpen(false);
  };

  if (!mounted) return null;

  const current = THEMES.find(t => t.id === active)!;

  return (
    <div className="fixed top-5 left-4 z-[9999]" style={{ fontFamily: "var(--heading-font), monospace" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          backgroundColor: current.accent,
          color: active === "yellow" ? "#000" : "#000",
          border: "3px solid #000",
          boxShadow: open ? "none" : "4px 4px 0 #000",
          transform: open ? "translate(2px,2px)" : "none",
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          fontSize: 9,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontWeight: 900,
          transition: "box-shadow 0.1s, transform 0.1s",
        }}
      >
        {/* Color dot */}
        <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:"#000", border:"1px solid #000", flexShrink:0 }} />
        SKIN {open ? "▲" : "▼"}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              transformOrigin: "top left",
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              width: 170,
              border: "3px solid #000",
              background: "#fff",
              boxShadow: "4px 4px 0 #000",
              zIndex: 9999,
            }}
          >
            {/* Header */}
            <div style={{ background: "#000", padding: "6px 12px" }}>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                CHOOSE SKIN
              </span>
            </div>

            {THEMES.map((t, i) => {
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => select(t.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: isActive ? t.accent : "#fff",
                    borderBottom: i < THEMES.length - 1 ? "2px solid #000" : "none",
                    border: "none",
                    borderBottomWidth: i < THEMES.length - 1 ? 2 : 0,
                    borderBottomStyle: "solid",
                    borderBottomColor: "#000",
                  }}
                >
                  {/* Swatch */}
                  <span style={{
                    width: 20,
                    height: 20,
                    background: t.accent,
                    border: "2px solid #000",
                    boxShadow: isActive ? "2px 2px 0 #000" : "1px 1px 0 #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 9,
                    fontWeight: 900,
                  }}>
                    {isActive ? "✓" : ""}
                  </span>
                  <span style={{
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 900,
                    color: isActive ? "#000" : "rgba(0,0,0,0.45)",
                  }}>
                    {t.label}
                  </span>
                </button>
              );
            })}

            {/* Footer */}
            <div style={{ background: "#f5f5f5", padding: "4px 12px", borderTop: "2px solid #000" }}>
              <span style={{ fontSize: 6, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(0,0,0,0.3)" }}>
                LIBRE_METRO v2
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
