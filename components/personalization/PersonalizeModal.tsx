"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Train, CheckCircle } from "lucide-react";
import Image from "next/image";

/* ─────────────────────────────────── TYPES ──────────────────────────────── */
type UserType = "student" | "tourist";
type Step = 1 | 2;

/* ─────────────────────────────────── DATA ───────────────────────────────── */
const COLLEGES = [
  { name: "Delhi University North Campus", nearest: "Vishwavidyalaya", line: "Yellow" },
  { name: "Delhi University South Campus", nearest: "Durgabai Deshmukh South Campus", line: "Pink" },
  { name: "Jamia Millia Islamia", nearest: "Jamia Millia Islamia", line: "Magenta" },
  { name: "IIT Delhi", nearest: "Hauz Khas", line: "Yellow" },
  { name: "Jawaharlal Nehru University", nearest: "Munirka", line: "Yellow" },
  { name: "Ambedkar University Delhi", nearest: "Kashmere Gate", line: "Red/Yellow" },
];

// Real photos from Wikimedia Commons (CC licensed, freely usable)
const TOURIST_PLACES = [
  {
    name: "India Gate",
    metro: "Central Secretariat",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/India_Gate_in_New_Delhi_03-2016.jpg/640px-India_Gate_in_New_Delhi_03-2016.jpg",
  },
  {
    name: "Qutub Minar",
    metro: "Qutab Minar",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Qutb_Minar_mausoleum.jpg/640px-Qutb_Minar_mausoleum.jpg",
  },
  {
    name: "Red Fort",
    metro: "Lal Quila",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Red_Fort_in_Delhi_03-2016_img3.jpg/640px-Red_Fort_in_Delhi_03-2016_img3.jpg",
  },
  {
    name: "Lotus Temple",
    metro: "Okhla NSIC",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Lotus_Temple_in_New_Delhi_03-2016_img3.jpg/640px-Lotus_Temple_in_New_Delhi_03-2016_img3.jpg",
  },
  {
    name: "Humayun's Tomb",
    metro: "J.L.N. Stadium",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Humayun%27s_Tomb_-_Delhi_%283%29.jpg/640px-Humayun%27s_Tomb_-_Delhi_%283%29.jpg",
  },
  {
    name: "Chandni Chowk",
    metro: "Chandni Chowk",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Chandni_Chowk_2014-05-11.jpg/640px-Chandni_Chowk_2014-05-11.jpg",
  },
];

const LINE_COLORS: Record<string, string> = {
  Yellow: "bg-brutal-yellow text-black",
  Pink: "bg-brutal-pink text-black",
  Magenta: "bg-brutal-lavender text-black",
  Blue: "bg-brutal-blue text-black",
  Red: "bg-brutal-pink text-black",
  "Red/Yellow": "bg-brutal-orange text-black",
};

/* ─────────────────────────────────── PROPS ──────────────────────────────── */
interface PersonalizeModalProps {
  onClose: () => void;
  onSave: (type: UserType) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function PersonalizeModal({ onClose, onSave }: PersonalizeModalProps) {
  const [step, setStep]             = useState<Step>(1);
  const [selected, setSelected]     = useState<UserType | null>(null);
  const [college, setCollege]       = useState<typeof COLLEGES[0] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsAnimating(true));
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /* ── Helpers ── */
  const goToStep2 = () => { if (selected) setStep(2); };
  const goBack    = () => { setStep(1); setCollege(null); };

  const handleFinish = () => {
    if (!selected) return;
    localStorage.setItem("libre_user_type", selected);
    if (selected === "student" && college) {
      localStorage.setItem("libre_college", college.name);
      localStorage.setItem("libre_nearest_station", college.nearest);
    }
    onSave(selected);
  };

  /* ── Shared container ── */
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 px-4 py-8 overflow-y-auto ${isAnimating ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`w-full max-w-lg bg-[#111827] border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-transform duration-300 ${isAnimating ? "scale-100" : "scale-95"}`}
      >
        {/* ── TOP BAR ── */}
        <div className="h-10 bg-white flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            {/* Step dots */}
            <div className={`h-2.5 w-2.5 border-2 border-black ${step >= 1 ? "bg-black" : "bg-white"}`} />
            <div className={`h-0.5 w-6 ${step === 2 ? "bg-black" : "bg-black/20"} transition-colors duration-300`} />
            <div className={`h-2.5 w-2.5 border-2 border-black ${step === 2 ? "bg-black" : "bg-white"}`} />
          </div>
          <span className="font-heading text-[8px] text-black tracking-[0.2em] uppercase font-black">
            STEP {step} / 2
          </span>
        </div>

        {/* ════════════════════ STEP 1 ════════════════════ */}
        {step === 1 && (
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                WHO ARE YOU?
              </h2>
              <p className="text-white/50 font-heading text-[9px] uppercase tracking-widest">
                PERSONALIZE YOUR METRO EXPERIENCE
              </p>
            </div>

            <div className="grid gap-4">
              {(
                [
                  { id: "student" as UserType, emoji: "🎓", label: "Student", desc: "Daily commute · College routes · Budget friendly" },
                  { id: "tourist" as UserType, emoji: "🗺️", label: "Tourist", desc: "Explore Delhi · Landmarks · Food spots" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`group text-left p-6 border-2 transition-all duration-150 cursor-pointer relative overflow-hidden ${
                    selected === opt.id
                      ? "bg-brutal-yellow border-black shadow-neo text-black translate-x-[-3px] translate-y-[-3px]"
                      : "bg-white/5 border-white/20 hover:border-white/50 hover:bg-white/10"
                  }`}
                >
                  {selected === opt.id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-5 w-5 text-black" strokeWidth={3} />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <span className="text-3xl leading-none mt-0.5">{opt.emoji}</span>
                    <div className="flex flex-col gap-1">
                      <span className={`text-lg font-black uppercase tracking-wider ${selected === opt.id ? "text-black" : "text-white"}`}>
                        {opt.label}
                      </span>
                      <span className={`text-xs font-heading uppercase tracking-widest ${selected === opt.id ? "text-black/70" : "text-white/40"}`}>
                        {opt.desc}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <button
                onClick={goToStep2}
                disabled={!selected}
                className={`w-full py-4 font-black uppercase tracking-widest text-sm transition-all ${
                  selected
                    ? "bg-brutal-yellow text-black border-2 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    : "bg-white/10 text-white/20 border-2 border-white/10 cursor-not-allowed"
                }`}
              >
                CONTINUE →
              </button>
              <button
                onClick={onClose}
                className="text-[9px] font-heading uppercase tracking-[0.25em] text-white/30 hover:text-white/60 transition-colors cursor-pointer text-center"
              >
                SKIP FOR NOW
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════ STEP 2 — STUDENT ════════════════════ */}
        {step === 2 && selected === "student" && (
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tight text-white">
                  SELECT YOUR COLLEGE
                </h2>
                <p className="text-white/40 font-heading text-[8px] uppercase tracking-widest">
                  WE&apos;LL FIND YOUR NEAREST METRO STATION
                </p>
              </div>
              <button
                onClick={goBack}
                className="shrink-0 flex items-center gap-1.5 font-heading text-[8px] uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-white/30 px-3 py-2"
              >
                <ArrowLeft className="h-3 w-3" />
                BACK
              </button>
            </div>

            {/* College list */}
            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
              {COLLEGES.map((c) => {
                const isSelected = college?.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setCollege(c)}
                    className={`text-left p-4 border-2 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-brutal-blue border-black shadow-neo translate-x-[-2px] translate-y-[-2px] text-black"
                        : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`font-heading text-[10px] uppercase tracking-wider font-black ${isSelected ? "text-black" : "text-white"}`}>
                        {c.name}
                      </span>
                      {isSelected && <CheckCircle className="h-4 w-4 text-black shrink-0" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Nearest metro preview */}
            {college && (
              <div className="bg-white/5 border-2 border-brutal-yellow/40 p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="h-10 w-10 bg-brutal-yellow border-2 border-black shadow-neo flex items-center justify-center shrink-0">
                  <Train className="h-5 w-5 text-black" strokeWidth={3} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading text-[8px] text-white/40 uppercase tracking-widest">
                    NEAREST METRO
                  </span>
                  <span className="font-heading text-sm font-black text-white uppercase tracking-wider">
                    {college.nearest}
                  </span>
                  <span className={`self-start font-heading text-[7px] font-black uppercase tracking-widest px-2 py-0.5 mt-0.5 border border-black ${LINE_COLORS[college.line] ?? "bg-brutal-lavender text-black"}`}>
                    {college.line} LINE
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleFinish}
              disabled={!college}
              className={`w-full py-4 font-black uppercase tracking-widest text-sm transition-all ${
                college
                  ? "bg-brutal-yellow text-black border-2 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                  : "bg-white/10 text-white/20 border-2 border-white/10 cursor-not-allowed"
              }`}
            >
              SAVE &amp; CONTINUE →
            </button>
          </div>
        )}

        {/* ════════════════════ STEP 2 — TOURIST ════════════════════ */}
        {step === 2 && selected === "tourist" && (
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tight text-white">
                  EXPLORE DELHI
                </h2>
                <p className="text-white/40 font-heading text-[8px] uppercase tracking-widest">
                  TOP SPOTS REACHABLE BY METRO
                </p>
              </div>
              <button
                onClick={goBack}
                className="shrink-0 flex items-center gap-1.5 font-heading text-[8px] uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-white/30 px-3 py-2"
              >
                <ArrowLeft className="h-3 w-3" />
                BACK
              </button>
            </div>

            {/* Places grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {TOURIST_PLACES.map((place) => (
                <div
                  key={place.name}
                  className="group border-2 border-white/10 overflow-hidden hover:border-brutal-yellow transition-all duration-200"
                >
                  {/* Image */}
                  <div className="relative h-28 w-full bg-white/5 overflow-hidden">
                    <Image
                      src={place.image}
                      alt={place.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                  {/* Info */}
                  <div className="p-3 bg-white/5 space-y-1">
                    <p className="font-heading text-[9px] font-black uppercase tracking-wider text-white truncate">
                      {place.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 text-brutal-yellow shrink-0" />
                      <span className="font-heading text-[7px] text-white/40 uppercase tracking-widest truncate">
                        {place.metro}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 font-black uppercase tracking-widest text-sm bg-brutal-yellow text-black border-2 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              SAVE &amp; START EXPLORING →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
