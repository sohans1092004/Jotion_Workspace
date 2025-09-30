"use client";

import { useEffect, useState } from "react";
import { PresenceAvatars } from "./presence-avatars";

interface PresenceWrapperProps {
  ownerId: string;
}

/**
 * Wrapper that delays rendering of presence components
 * to avoid conflicts with editor initialization
 */
export function PresenceWrapper({ ownerId }: PresenceWrapperProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Longer delay to handle multiple users joining
    const timer = setTimeout(() => {
      setShow(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <PresenceAvatars ownerId={ownerId} />
    </div>
  );
}
