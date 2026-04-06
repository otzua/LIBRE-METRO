"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Global component to handle auth state changes and cleanup URL fragments (hashes)
 * left behind by OAuth redirects.
 */
export default function AuthListener() {
  useEffect(() => {
    // 1. Initial check + hash cleanup
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && typeof window !== "undefined" && window.location.hash) {
        // Clean hash from URL immediately if we have a session
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });

    // 2. Listen for changes (includes the moment a redirect hash is processed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || session) && typeof window !== "undefined" && window.location.hash) {
        // Clean hash from URL
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null; // This component doesn't render anything
}
