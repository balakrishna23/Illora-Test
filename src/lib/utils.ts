import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Serialises a JSON-LD object for safe embedding in a <script> tag via
// dangerouslySetInnerHTML. JSON.stringify alone does not escape the `<`
// character, which means a payload containing `</script>` (e.g. from a
// future CMS or ATS field) would prematurely close the script tag and
// allow injected HTML/JS to execute. Replacing `<` with its Unicode escape
// `<` keeps the JSON valid while making it safe in an HTML context.
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
