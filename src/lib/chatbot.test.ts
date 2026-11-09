import { describe, expect, it } from "vitest";

import { getReplyByKey, matchReply } from "@/lib/chatbot";

describe("matchReply", () => {
  it.each(["What sectors do you cover?", "Do you place machine learning engineers?", "cyber roles", "data analytics"])(
    "answers %s with the specialisms",
    (input) => {
      expect(matchReply(input).text).toContain("AI Engineering, Cyber Security, and Data Analytics");
    }
  );

  it.each(["I'm a nurse", "aged care", "construction", "healthcare", "I'm an electrician"])(
    "treats %s as outside Illoura's specialisms",
    (input) => {
      expect(matchReply(input)).toBe(getReplyByKey("no-match"));
    }
  );
});
