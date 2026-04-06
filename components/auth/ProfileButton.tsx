"use client";

import { useState, useEffect, useRef } from "react";
import { CircleUser, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface ProfileButtonProps {
  inDock?: boolean;
  onOpenAuth: () => void;
}

export default function ProfileButton({ inDock = false, onOpenAuth }: ProfileButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Proactively clear hash if user is logged in
      if (currentUser && typeof window !== "undefined" && window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Clear the hash from URL after successful sign-in (OAuth redirect)
        if (typeof window !== "undefined" && window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    setShowDropdown(false);
  };

  const getInitials = (u: User) => {
    const name = u.user_metadata?.full_name || u.email || "";
    return name
      .split(/[\s@]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s: string) => s[0].toUpperCase())
      .join("");
  };

  // Check both avatar_url (standard) and picture (Google specific)
  const avatarUrl = (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) as string | undefined;

  return (
    <div className="relative w-full h-full" ref={dropdownRef}>
      {user ? (
        /* ── LOGGED-IN STATE ── */
        <>
            <button
            onClick={() => setShowDropdown((v) => !v)}
            className={`w-full h-full flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer select-none`}
            aria-label="Account menu"
          >
            <div className="relative h-6 w-6 rounded-full border-2 border-black overflow-hidden flex items-center justify-center bg-brutal-yellow shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      const initials = document.createElement('span');
                      initials.className = "font-heading text-[8px] font-black text-black";
                      initials.innerText = getInitials(user);
                      parent.appendChild(initials);
                    }
                  }}
                />
              ) : (
                <span className="font-heading text-[8px] font-black text-black">
                  {getInitials(user)}
                </span>
              )}
            </div>
            <span className="text-[8px] font-heading tracking-widest uppercase text-black/60 font-bold group-hover:text-black">
              Account
            </span>
          </button>

          {/* DROPDOWN - OPENS UPWARDS */}
          {showDropdown && (
            <div className={`absolute right-0 bottom-[calc(100%+12px)] w-40 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-100`}>
              {/* User info */}
              <div className="px-4 py-2 border-b-[3px] border-black bg-black/5">
                <p className="font-heading text-[7px] text-black/40 uppercase tracking-widest font-bold truncate">
                  SIGNED_IN
                </p>
                <p className="font-heading text-[8px] text-black font-black uppercase tracking-wider truncate mt-0.5">
                  {user.user_metadata?.full_name || user.email}
                </p>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2 px-4 py-2 font-heading text-[8px] text-black uppercase tracking-widest font-black hover:bg-brutal-pink/20 active:bg-brutal-pink/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loggingOut ? (
                  <div className="h-3 w-3 border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <LogOut size={12} strokeWidth={3} />
                )}
                {loggingOut ? "EXIT..." : "LOGOUT"}
              </button>
            </div>
          )}
        </>
      ) : (
        /* ── LOGGED-OUT STATE ── */
        <button
          onClick={onOpenAuth}
          className="w-full h-full flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer select-none"
          aria-label="Sign in"
        >
          <div className="h-6 w-6 bg-white border-2 border-black rounded-full flex items-center justify-center shrink-0">
            <CircleUser size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-[8px] font-heading tracking-[0.1em] uppercase text-black/60 font-bold group-hover:text-black">
            Login
          </span>
        </button>
      )}
    </div>
  );
}
