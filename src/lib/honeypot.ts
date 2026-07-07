// Honeypot spam protection for public, unauthenticated forms. A decoy field
// is rendered hidden from humans (off-screen, aria-hidden, no tab stop) but
// visible to naive bots that fill every input. A non-empty value means a bot.
//
// Client-safe: only exports a constant and a pure function, no server imports.

export const HONEYPOT_FIELD = "contactFax";

// Returns true if the submission looks automated and should be silently
// dropped. We return "success" to the bot rather than an error so it can't
// tune around the check.
export function isBotSubmission(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === "string" && value.trim().length > 0;
}
