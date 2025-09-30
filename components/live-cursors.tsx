"use client";

import { useOthers } from "@liveblocks/react";
import { memo } from "react";

function Cursor({ color, x, y, name }: { color: string; x: number; y: number; name: string }) {
  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.928548 2.18278C0.619075 1.37094 1.42087 0.577818 2.2293 0.896107L14.3863 5.68247C15.2271 6.0135 15.2325 7.20148 14.3947 7.54008L9.85984 9.373C9.61167 9.47331 9.41408 9.66891 9.31127 9.91604L7.43907 14.4165C7.09186 15.2511 5.90335 15.2333 5.58136 14.3886L0.928548 2.18278Z"
          fill={color}
        />
      </svg>
      {/* Name label */}
      <div
        className="absolute top-5 left-5 px-2 py-1 rounded-md text-xs text-white font-medium whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}

export const LiveCursors = memo(() => {
  const others = useOthers();

  return (
    <>
      {others
        .filter((other) => other.presence.cursor !== null)
        .map((other) => (
          <Cursor
            key={`${other.id}-${other.connectionId}`}
            color={other.info?.color || "#000"}
            x={other.presence.cursor!.x}
            y={other.presence.cursor!.y}
            name={other.info?.name || "Anonymous"}
          />
        ))}
    </>
  );
});

LiveCursors.displayName = "LiveCursors";
