"use client";

import { useState, useEffect } from "react";
import SearchContainer from "@/components/search/SearchContainer";
import LocationSystem from "@/components/location/LocationSystem";
import BottomDock, { NavItem } from "@/components/navigation/BottomDock";
import PersonalizeModal from "@/components/personalization/PersonalizeModal";
import CommunityTab from "@/components/community/CommunityTab";
import AuthModal from "@/components/auth/AuthModal";

export default function Home() {
  const [fromStation, setFromStation] = useState("");
  const [toStation,   setToStation]   = useState("");
  const [activeTab,   setActiveTab]   = useState<NavItem>("home");
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [showCommunity,        setShowCommunity]        = useState(false);
  const [showAuthModal,        setShowAuthModal]        = useState(false);
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent]   = useState("#FF2E88");

  useEffect(() => {
    setMounted(true);
    // Read current accent from html style
    const updateAccent = () => {
      const a = document.documentElement.style.getPropertyValue("--accent").trim();
      if (a) setAccent(a);
    };
    updateAccent();

    if (!localStorage.getItem("libre_personalized")) {
      const t = setTimeout(() => handleTabChange("personalize"), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleTabChange = (tab: NavItem) => {
    const target = tab === activeTab && tab !== "home" ? "home" : tab;
    setActiveTab(target);
    if (target === "home") {
      setShowPersonalizeModal(false);
      setShowCommunity(false);
    } else if (target === "community") {
      setShowPersonalizeModal(false);
      setShowCommunity(true);
    } else if (target === "personalize") {
      setShowCommunity(false);
      setShowPersonalizeModal(true);
    }
  };

  const closePersonalizeModal = () => {
    localStorage.setItem("libre_personalized", "true");
    handleTabChange("home");
  };

  const BORDER = "3px solid #000";
  const SHADOW = "4px 4px 0 #000";
  const FONT_HEADING = "var(--heading-font), monospace";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 120, paddingTop: 16 }}>

      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 500, marginBottom: 16 }}>

        {/* Main title block */}
        <div style={{
          backgroundColor: accent,
          border: BORDER,
          boxShadow: SHADOW,
          padding: "20px 20px 16px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Corner tag */}
          <div style={{
            position: "absolute", top: 0, right: 0,
            background: "#000", padding: "4px 10px",
            borderLeft: BORDER, borderBottom: BORDER,
          }}>
            <span style={{ fontFamily: FONT_HEADING, fontSize: 7, color: "#fff", letterSpacing: "0.2em" }}>DMRC // LIVE</span>
          </div>

          {/* Status row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, background: "#000", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: FONT_HEADING, fontSize: 7, color: "rgba(0,0,0,0.55)", letterSpacing: "0.18em" }}>
              SYSTEM_ONLINE // 230 STATIONS
            </span>
          </div>

          {/* Big title */}
          <div style={{ fontFamily: FONT_HEADING, fontSize: 26, lineHeight: 1.1, fontWeight: 900, color: "#000", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            LIBRE<br />
            <span style={{ color: "#fff", WebkitTextStroke: "2px #000" }}>METRO</span>
          </div>

          <div style={{ fontFamily: FONT_HEADING, fontSize: 7, marginTop: 8, color: "rgba(0,0,0,0.5)", letterSpacing: "0.15em" }}>
            SHORTEST_PATH · DIJKSTRA · FREE · OPEN_SOURCE
          </div>

          {/* Decorative bars (bottom right) */}
          <div style={{ position: "absolute", bottom: 8, right: 16, display: "flex", gap: 3, alignItems: "flex-end", opacity: 0.25 }}>
            {[14,8,18,10,20,12,16].map((h, i) => (
              <div key={i} style={{ width: 5, height: h, background: "#000" }} />
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", border: BORDER, borderTop: "none" }}>
          {[
            { label: "LINES",    value: "11" },
            { label: "STATIONS", value: "230" },
            { label: "ALGO",     value: "DIJKSTRA" },
          ].map((item, i) => (
            <div key={i} style={{
              flex: 1,
              padding: "8px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "#fff",
              borderRight: i < 2 ? BORDER : "none",
            }}>
              <span style={{ fontFamily: FONT_HEADING, fontSize: 6, color: "rgba(0,0,0,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{item.label}</span>
              <span style={{ fontFamily: FONT_HEADING, fontSize: 11, color: "#000", fontWeight: 900, marginTop: 2 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEARCH ──────────────────────────────────────────────────────── */}
      <SearchContainer
        from={fromStation}
        setFrom={setFromStation}
        to={toStation}
        setTo={setToStation}
      />

      {/* ── LOCATION ────────────────────────────────────────────────────── */}
      <LocationSystem onStationFound={(s) => setFromStation(s.toUpperCase())} />

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <div style={{
        width: "100%", maxWidth: 500, marginTop: 40,
        border: BORDER, background: "#000",
        boxShadow: `4px 4px 0 ${accent}`,
        padding: "14px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontFamily: FONT_HEADING, fontSize: 8, color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em" }}>
            MADE BY{" "}
            <a href="https://github.com/otzua/LIBRE-METRO" target="_blank" rel="noopener noreferrer"
              style={{ color: accent, textDecoration: "underline" }}>
              KRISH
            </a>{" "}
            &amp; SHUBHAM
          </div>
          <div style={{ fontFamily: FONT_HEADING, fontSize: 6, color: "rgba(255,255,255,0.25)", marginTop: 3, letterSpacing: "0.15em" }}>
            LIBRE_METRO · OPEN SOURCE
          </div>
        </div>
        {/* LIVE pill */}
        <div style={{
          backgroundColor: accent, border: "2px solid #fff",
          padding: "5px 10px", display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ width: 6, height: 6, background: "#000", borderRadius: "50%", display: "inline-block" }} />
          <span style={{ fontFamily: FONT_HEADING, fontSize: 7, color: "#000", fontWeight: 900, letterSpacing: "0.15em" }}>LIVE</span>
        </div>
      </div>

      {/* ── DOCK ────────────────────────────────────────────────────────── */}
      <BottomDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {mounted && showPersonalizeModal && (
        <PersonalizeModal onClose={closePersonalizeModal} onSave={() => closePersonalizeModal()} />
      )}
      {mounted && showCommunity && (
        <CommunityTab onClose={() => handleTabChange("home")} />
      )}
      {mounted && showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
