import React from "react";
import { Link } from "react-router-dom";
import type { Person } from "@/entities/person/types";

function PersonCard({ person }: { person: Person }) {
  // Generate fallback initials (e.g., "Luke Skywalker" → "LS")
  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      to={`/people/${person.id}`}
      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-[rgba(0,209,255,0.08)] transition-transform hover:scale-[1.01] sw-panel"
      aria-label={`Open details for ${person.name}`}
    >
      {/* Circular avatar with holo-style glow and fallback initials */}
      <div
        className="size-14 flex items-center justify-center rounded-full text-lg font-semibold text-[--sw-holo] border border-[--sw-border] shadow-[0_0_8px_rgba(0,209,255,0.3)_inset]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(0,209,255,0.15), rgba(0,0,0,0.3))",
        }}
      >
        {initials}
      </div>

      {/* Character info (name, number of films/starships) */}
      <div className="min-w-0">
        <div className="font-medium truncate">{person.name}</div>
        <div className="text-sm opacity-70 truncate">
          Films: {person.films.length} · Starships: {person.starships.length}
        </div>
      </div>
    </Link>
  );
}
export default React.memo(PersonCard);
