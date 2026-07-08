import { describe, expect, it } from "vitest";

import {
  escapeHtml,
  renderBodyHtml,
  renderBodyText,
  renderTemplate,
} from "@/features/admin/campaigns/template";

describe("renderTemplate", () => {
  it("substitutes name and company", () => {
    const result = renderTemplate("Hi {{name}} from {{company}}", {
      email: "a@b.com",
      name: "Sam",
      company: "Acme",
    });
    expect(result).toBe("Hi Sam from Acme");
  });

  it("falls back when values are missing or blank", () => {
    const result = renderTemplate("Hi {{name}} from {{company}}", {
      email: "a@b.com",
      name: "  ",
      company: null,
    });
    expect(result).toBe("Hi there from your company");
  });

  it("tolerates whitespace inside braces and leaves unknown placeholders visible", () => {
    expect(renderTemplate("Hi {{ name }}", { email: "a@b.com", name: "Sam" })).toBe("Hi Sam");
    expect(renderTemplate("Hi {{nickname}}", { email: "a@b.com" })).toBe("Hi {{nickname}}");
  });
});

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml(`<b>"Tom & Jerry's"</b>`)).toBe(
      "&lt;b&gt;&quot;Tom &amp; Jerry&#39;s&quot;&lt;/b&gt;"
    );
  });
});

describe("renderBodyHtml", () => {
  it("turns blank-line-separated text into paragraphs with line breaks", () => {
    const html = renderBodyHtml("First line\nsecond line\n\nNext paragraph", "https://u");
    expect(html).toContain("<p>First line<br />second line</p>");
    expect(html).toContain("<p>Next paragraph</p>");
  });

  it("escapes user content and appends the unsubscribe link", () => {
    const html = renderBodyHtml("<script>alert(1)</script>", "https://example.com/u");
    expect(html).not.toContain("<script>");
    expect(html).toContain('href="https://example.com/u"');
  });
});

describe("renderBodyText", () => {
  it("appends the unsubscribe URL", () => {
    expect(renderBodyText("Hello", "https://example.com/u")).toBe(
      "Hello\n\nUnsubscribe: https://example.com/u"
    );
  });
});
