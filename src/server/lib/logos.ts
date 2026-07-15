import { existsSync } from "node:fs";
import path from "node:path";

// Returns the public URL for a logo in public/logos/ if the file exists,
// otherwise null — lets components fall back to a text badge until the real
// logo file is dropped in. Server-only (uses fs); safe in Server Components.
export function logoUrl(filename: string): string | null {
  const absolute = path.join(process.cwd(), "public", "logos", filename);
  return existsSync(absolute) ? `/logos/${filename}` : null;
}
