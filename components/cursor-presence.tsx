"use client";

import { useMyPresence } from "@liveblocks/react";
import { useCallback, useEffect, useState } from "react";
import { LiveCursors } from "./live-cursors";

interface CursorPresenceProps {
  children: React.ReactNode;
}

export function CursorPresence({ children }: CursorPresenceProps) {
  const [, updateMyPresence] = useMyPresence();
  const [isReady, setIsReady] = useState(false);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isReady) return;
      const cursor = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
      updateMyPresence({ cursor });
    },
    [updateMyPresence, isReady]
  );

  const handlePointerLeave = useCallback(() => {
    if (!isReady) return;
    updateMyPresence({ cursor: null });
  }, [updateMyPresence, isReady]);

  // Delay initialization to avoid setState during render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      updateMyPresence({ isEditing: true });
    }, 1000); // Increased to 1 second
    
    return () => {
      clearTimeout(timer);
      if (isReady) {
        updateMyPresence({ isEditing: false, cursor: null });
      }
    };
  }, [updateMyPresence, isReady]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-full"
    >
      <LiveCursors />
      {children}
    </div>
  );
}
