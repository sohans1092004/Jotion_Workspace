"use client";

import { ReactNode } from "react";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { useUser } from "@clerk/clerk-react";
import { PresenceUserInfo } from "./presence-user-info";

interface PresenceRoomProps {
  documentId: string;
  ownerId: string;
  children: ReactNode;
}

// Generate color for user
function generateUserColor(userId: string): string {
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#f97316"];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Separate Room provider ONLY for presence features
 * This is independent of the editor's Liveblocks room
 */
export function PresenceRoom({ documentId, ownerId, children }: PresenceRoomProps) {
  const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "";
  
  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>
      <RoomProvider
        id={`presence-${documentId}`}
        initialPresence={{
          cursor: null,
          isEditing: true,
        }}
      >
        <PresenceUserInfo />
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}
