"use client";

import { useEffect, useState } from "react";
import { LiveCursors } from "./live-cursors";
import { useMyPresence } from "@liveblocks/react";
import { useCallback } from "react";

/**
 * Wrapper that handles cursor tracking with delayed initialization
 */
export function CursorsWrapper({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [, updateMyPresence] = useMyPresence();

  // Delay initialization - longer delay for multiple users
  useEffect(() => {
    // First delay to let editor initialize
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 300);

    // Second delay to activate presence
    const showTimer = setTimeout(() => {
      setShow(true);
      if (isReady) {
        updateMyPresence({ isEditing: true });
      }
    }, 500);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(showTimer);
      if (isReady) {
        updateMyPresence({ isEditing: false, cursor: null });
      }
    };
  }, [updateMyPresence, isReady]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!show) return;
      const cursor = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
      updateMyPresence({ cursor });
    },
    [updateMyPresence, show]
  );

  const handlePointerLeave = useCallback(() => {
    if (!show) return;
    updateMyPresence({ cursor: null });
  }, [updateMyPresence, show]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-full"
    >
      {show && <LiveCursors />}
      {children}
    </div>
  );
}
