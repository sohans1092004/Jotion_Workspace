"use client";

import { useEffect } from "react";
import { useSelf, useUpdateMyPresence } from "@liveblocks/react";
import { useUser } from "@clerk/clerk-react";

/**
 * Component that sets user info in Liveblocks presence
 * Must be inside a RoomProvider
 */
export function PresenceUserInfo() {
  const { user } = useUser();
  const self = useSelf();
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    if (user && updateMyPresence) {
      // Set user info in presence
      const userInfo = {
        name: user.fullName || user.firstName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
        avatar: user.imageUrl || "",
        userId: user.id,
      };
      
      // Update presence with user info
      updateMyPresence({
        userInfo,
        isEditing: true,
      });
    }
  }, [user, updateMyPresence]);

  return null; // This component doesn't render anything
}
