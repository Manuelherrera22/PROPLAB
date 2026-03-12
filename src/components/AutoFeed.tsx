"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

const FEED_INTERVAL = 2 * 60 * 1000; // 2 minutes

export default function AutoFeed() {
  const { workspaceId } = useStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function feed() {
      try {
        const res = await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
        });
        const data = await res.json();
        if (data.ok) {
          console.log(`[PROPLAB Feed] ${data.message}`);
        }
      } catch {
        // Silent fail — feed is background
      }
    }

    // First feed after 30s
    const initial = setTimeout(() => {
      feed();
      // Then every 2 minutes
      intervalRef.current = setInterval(feed, FEED_INTERVAL);
    }, 30_000);

    return () => {
      clearTimeout(initial);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [workspaceId]);

  return null; // Invisible component
}
