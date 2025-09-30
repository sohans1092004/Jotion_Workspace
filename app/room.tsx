"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react";
import { useUser } from "@clerk/clerk-react";

interface RoomProps {
  id: string;
  children: ReactNode;
}

// Generate a consistent color for each user based on their ID
function generateUserColor(userId: string): string {
  const colors = [
    "#ef4444", // red
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#6366f1", // indigo
    "#f97316", // orange
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Room({ id, children }: RoomProps) {
  const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "";
  const { user } = useUser();

  return (
    <LiveblocksProvider
      publicApiKey={publicApiKey}
      resolveUsers={async ({ userIds }) => {
        try {
          // Fetch user info from Clerk via Convex
          const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
          const response = await fetch(`${convexUrl}/api/action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: "users:getUsersByIds",
              args: { userIds },
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch users");
          }

          const result = await response.json();
          const users = result.value;
          
          return users.map((userData: any) => ({
            name: userData.name,
            avatar: userData.avatar,
            color: generateUserColor(userData.id),
          }));
        } catch (error) {
          console.error("Error fetching users for cursors:", error);
          // Fallback
          return userIds.map((userId) => ({
            name: userId === user?.id ? (user?.fullName || user?.firstName || "User") : "User",
            avatar: userId === user?.id ? user?.imageUrl : "",
            color: generateUserColor(userId),
          }));
        }
      }}
      resolveMentionSuggestions={async ({ text }) => {
        // Optional: for @mentions feature
        return [];
      }}
    >
      <RoomProvider
        id={id}
        initialPresence={{
          cursor: null,
          isEditing: false,
        }}
      >
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}