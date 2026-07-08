import { describe, expect, it } from "vitest";

import { dedupeRecipients } from "@/features/admin/campaigns/recipients";

describe("dedupeRecipients", () => {
  it("dedupes by email case-insensitively and keeps name/company from any source", () => {
    const result = dedupeRecipients(
      [
        { email: "Sam@Example.com" },
        { email: "sam@example.com", name: "Sam" },
        { email: "sam@example.com ", company: "Acme" },
      ],
      []
    );

    expect(result).toEqual([{ email: "sam@example.com", name: "Sam", company: "Acme" }]);
  });

  it("drops suppressed and blank addresses", () => {
    const result = dedupeRecipients(
      [
        { email: "keep@example.com", name: "Keep" },
        { email: "Gone@Example.com", name: "Gone" },
        { email: "   " },
      ],
      ["gone@example.com"]
    );

    expect(result).toEqual([{ email: "keep@example.com", name: "Keep", company: undefined }]);
  });
});
