export type MediaItem =
  | { type: "image"; src: string; alt?: string; caption?: string }
  | { type: "video"; src: string; provider?: "youtube" | "loom" | "file"; caption?: string };

export interface ReleaseNote {
  version: string;
  date: string; // ISO date
  title?: string;
  features?: string[];
  fixes?: string[];
  improvements?: string[];
  media?: MediaItem[];
}

// Add new entries at the top. Update CURRENT_VERSION to the latest version.
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "1.4.0",
    date: "2026-06-03",
    title: "Track product updates from the new What's New panel",
    features: [
      "Added a What's New release notes panel in the header so you can track recent updates.",
      "Each release entry now supports inline images and embedded videos (YouTube, Loom, uploads).",
    ],
    improvements: [
      "Standardized header actions with consistent spacing and iconography.",
      "Persisted read/unread state for release notes across sessions.",
    ],
    fixes: [
      "Resolved an issue where the Institution modal could hide the Papers and Citations metrics.",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-05-20",
    title: "Shortlist pathways and explore them with the new 9-metric radar",
    features: [
      "Bookmark pathways and switch between All and Shortlisted views.",
      "New radar chart with 9 Key Metrics on each pathway profile.",
    ],
    improvements: [
      "Unified 1400px container width across the platform.",
      "Refined VCG Score popovers with weighted breakdown bars.",
    ],
    fixes: [
      "Fixed sorting on the Pathways table when IP Score values were tied.",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-04-28",
    title: "Research & IP Landscape",
    features: [
      "Added Scientific Publications and Patent Landscape views with topic filtering.",
      "Top 3 Trending institutions and IP Holders are now highlighted.",
    ],
    improvements: [
      "Recolored Feedstock vs Product charts for clearer distinction.",
    ],
    fixes: [],
  },
];

export const CURRENT_VERSION = RELEASE_NOTES[0].version;
