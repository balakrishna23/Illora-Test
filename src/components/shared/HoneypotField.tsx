import { HONEYPOT_FIELD } from "@/lib/honeypot";

// Decoy field for spam bots. Hidden from humans and assistive tech, and kept
// out of the tab order, so a real user never fills it — but naive bots that
// populate every input will, which flags the submission server-side.
export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={HONEYPOT_FIELD}>Do not fill this in</label>
      <input
        type="text"
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
