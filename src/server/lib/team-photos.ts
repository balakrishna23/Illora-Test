import { existsSync } from "node:fs";
import path from "node:path";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

// Returns the public URL for a team member's photo in public/team/, named after
// the member in kebab-case (e.g. "Sarah Bolt" -> sarah-bolt.jpg), or null if no
// file has been added yet. Server-only (uses fs); safe in Server Components.
export function teamPhotoUrl(name: string): string | null {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  for (const ext of EXTENSIONS) {
    const filename = `${slug}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", "team", filename))) {
      return `/team/${filename}`;
    }
  }
  return null;
}
