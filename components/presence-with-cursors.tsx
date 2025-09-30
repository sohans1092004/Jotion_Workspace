"use client";

import { useMyPresence } from "@liveblocks/react";
import { useCallback, useEffect } from "react";
import { PresenceAvatars } from "./presence-avatars";
import { LiveCursors } from "./live-cursors";

interface PresenceWithCursorsProps {
  children: React.ReactNode;
  ownerId: string;
}

export function PresenceWithCursors({ children, ownerId }: PresenceWithCursorsProps) {
  const [, updateMyPresence] = useMyPresence();

  useEffect(() => {
    // Set user as active
    updateMyPresence({ isEditing: true });
    
    return () => {
      updateMyPresence({ isEditing: false, cursor: null });
    };
  }, [updateMyPresence]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const cursor = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
      updateMyPresence({ cursor });
    },
    [updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  return (
    <>
      {/* Avatars - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <PresenceAvatars ownerId={ownerId} />
      </div>

      {/* Cursors overlay */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <LiveCursors />
      </div>

      {/* Content */}
      {children}
    </>
  );
}
