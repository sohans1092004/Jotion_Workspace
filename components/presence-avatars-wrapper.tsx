"use client";

import { Suspense } from "react";
import { PresenceAvatars } from "./presence-avatars";

interface PresenceAvatarsWrapperProps {
  ownerId: string;
}

// Error boundary wrapper for PresenceAvatars
export function PresenceAvatarsWrapper({ ownerId }: PresenceAvatarsWrapperProps) {
  return (
    <Suspense fallback={null}>
      <PresenceAvatarsErrorBoundary ownerId={ownerId} />
    </Suspense>
  );
}

function PresenceAvatarsErrorBoundary({ ownerId }: PresenceAvatarsWrapperProps) {
  try {
    return <PresenceAvatars ownerId={ownerId} />;
  } catch (error) {
    // If not in a Room context, silently return null
    return null;
  }
}
