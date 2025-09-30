"use client";

import { useOthers, useSelf } from "@liveblocks/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
];

interface PresenceAvatarsProps {
  ownerId: string;
}

export function PresenceAvatars({ ownerId }: PresenceAvatarsProps) {
  // Use non-suspense hooks which return null if not in a Room
  const others = useOthers();
  const currentUser = useSelf();
  const { user } = useUser();
  const isOwner = user?.id === ownerId;

  // Show ALL connections (not just unique users)
  // This way you can see all 3 windows even if same user
  const allConnections = others || [];

  // Show "Just you" message when alone OR when room is initializing
  if (!others || allConnections.length === 0) {
    return (
      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          👤 {currentUser ? "Just you" : "Connecting..."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center -space-x-2">
        {allConnections.slice(0, 3).map((other, index) => {
          const userInfo = other.presence?.userInfo;
          
          // Privacy logic:
          // - Owner sees all real names
          // - Non-owners see only owner's name, others are "Anonymous"
          let name = "Anonymous";
          let avatar = "";
          
          if (isOwner) {
            // Owner sees everyone's real name
            name = userInfo?.name || "Anonymous";
            avatar = userInfo?.avatar || "";
          } else {
            // Non-owner: show only owner's name
            if (userInfo?.userId === ownerId) {
              name = userInfo?.name || "Owner";
              avatar = userInfo?.avatar || "";
            }
            // All other users remain "Anonymous" with no avatar
          }
          
          const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={`${other.id}-${other.connectionId}`}
              className="relative group"
              title={name}
            >
              <Avatar className="h-7 w-7 border-2 border-background">
                {avatar ? (
                  <AvatarImage src={avatar} alt={name} />
                ) : null}
                <AvatarFallback className={cn("text-xs font-medium text-white", color)}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {name}
              </div>
            </div>
          );
        })}
        {allConnections.length > 3 && (
          <div key="overflow-count" className="relative">
            <Avatar className="h-7 w-7 border-2 border-background">
              <AvatarFallback className="bg-muted text-xs font-medium">
                +{allConnections.length - 3}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground ml-2">
        {allConnections.length} {allConnections.length === 1 ? "connection" : "connections"}
      </span>
    </div>
  );
}
