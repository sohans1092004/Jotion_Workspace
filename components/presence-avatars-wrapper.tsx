"use client";

import { Suspense } from "react";
import { PresenceAvatars } from "./presence-avatars";

// Error boundary wrapper for PresenceAvatars
export function PresenceAvatarsWrapper() {
  return (
    <Suspense fallback={null}>
      <PresenceAvatarsErrorBoundary />
    </Suspense>
  );
}

function PresenceAvatarsErrorBoundary() {
  try {
    return <PresenceAvatars />;
  } catch (error) {
    // If not in a Room context, silently return null
    return null;
  }
}
