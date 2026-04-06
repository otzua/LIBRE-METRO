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
  const [toStation, setToStation] = useState("");
  
  // Dock & Modal States
  const [activeTab, setActiveTab] = useState<NavItem>("home");
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // FIRST VISIT DETECTION
    const isPersonalized = localStorage.getItem("libre_personalized");
    
    if (isPersonalized === null) {
      const timer = setTimeout(() => {
        handleTabChange("personalize");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTabChange = (tab: NavItem) => {
    // TOGGLE LOGIC: If same tab clicked, go back to home
    const targetTab = (tab === activeTab && tab !== "home") ? "home" : tab;
    
    setActiveTab(targetTab);
    
    if (targetTab === "home") {
      setShowPersonalizeModal(false);
      setShowCommunity(false);
    } else if (targetTab === "community") {
      setShowPersonalizeModal(false);
      setShowCommunity(true);
    } else if (targetTab === "personalize") {
      setShowCommunity(false);
      setShowPersonalizeModal(true);
    }
  };

  const closePersonalizeModal = () => {
    localStorage.setItem("libre_personalized", "true");
    handleTabChange("home");
  };

  const handlePersonalizeSave = (_type: "student" | "tourist") => {
    closePersonalizeModal();
  };
  
  const closeCommunity = () => {
    handleTabChange("home");
  };

  const handleUpdateFrom = (station: string) => {
    setFromStation(station.toUpperCase());
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] py-12 pb-24">
      <SearchContainer 
        from={fromStation} 
        setFrom={setFromStation} 
        to={toStation} 
        setTo={setToStation} 
      />
      
      {/* Location feature passed a callback to update search fields */}
      <LocationSystem onStationFound={handleUpdateFrom} />
      

      <BottomDock 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* MODALS */}
      {mounted && showPersonalizeModal && (
        <PersonalizeModal 
          onClose={closePersonalizeModal} 
          onSave={handlePersonalizeSave} 
        />
      )}
      
      {/* COMMUNITY TAB — Full-screen overlay */}
      {mounted && showCommunity && (
        <CommunityTab 
          onClose={closeCommunity} 
        />
      )}

      {/* GLOBAL AUTH MODAL - CENTERED */}
      {mounted && showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
