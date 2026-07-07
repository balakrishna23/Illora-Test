import { describe, expect, it } from "vitest";

import { validateReadOnlySql, wrapWithRowLimit } from "@/server/lib/sql-safety";

describe("validateReadOnlySql", () => {
  it("accepts a plain SELECT", () => {
    const result = validateReadOnlySql("SELECT * FROM jobs WHERE status = 'active'");
    expect(result.valid).toBe(true);
  });

  it("accepts a WITH ... SELECT", () => {
    const result = validateReadOnlySql(
      "WITH recent AS (SELECT * FROM applications) SELECT count(*) FROM recent"
    );
    expect(result.valid).toBe(true);
  });

  it("strips comments before validating", () => {
    const result = validateReadOnlySql(
      "-- get active jobs\nSELECT * FROM jobs /* only active */ WHERE status = 'active'"
    );
    expect(result.valid).toBe(true);
  });

  it("allows one trailing semicolon", () => {
    const result = validateReadOnlySql("SELECT 1;");
    expect(result.valid).toBe(true);
  });

  it("rejects a statement that doesn't start with SELECT/WITH", () => {
    const result = validateReadOnlySql("UPDATE jobs SET status = 'closed'");
    expect(result.valid).toBe(false);
  });

  it("rejects multi-statement chaining", () => {
    const result = validateReadOnlySql("SELECT 1; DROP TABLE jobs;");
    expect(result.valid).toBe(false);
  });

  it("rejects a data-modifying CTE", () => {
    const result = validateReadOnlySql(
      "WITH x AS (INSERT INTO jobs (title) VALUES ('x') RETURNING id) SELECT * FROM x"
    );
    expect(result.valid).toBe(false);
  });

  it("rejects DO $$ ... $$ blocks", () => {
    const result = validateReadOnlySql("DO $$ BEGIN DELETE FROM jobs; END $$");
    expect(result.valid).toBe(false);
  });

  it("rejects comment-split keyword injection", () => {
    const result = validateReadOnlySql("SELECT 1; DR/**/OP TABLE jobs");
    expect(result.valid).toBe(false);
  });

  it("does not false-positive on words containing blocked keywords", () => {
    const result = validateReadOnlySql("SELECT settings, docreset FROM jobs");
    expect(result.valid).toBe(true);
  });

  it("rejects DELETE/TRUNCATE/GRANT/CALL/EXECUTE keywords", () => {
    for (const sql of [
      "SELECT 1 WHERE DELETE",
      "TRUNCATE jobs",
      "GRANT ALL ON jobs TO PUBLIC",
      "CALL some_proc()",
      "EXECUTE some_stmt",
    ]) {
      expect(validateReadOnlySql(sql).valid).toBe(false);
    }
  });
});

describe("wrapWithRowLimit", () => {
  it("wraps the query in a limited outer subquery", () => {
    const wrapped = wrapWithRowLimit("SELECT * FROM jobs", 50);
    expect(wrapped).toContain("SELECT * FROM (");
    expect(wrapped).toContain("SELECT * FROM jobs");
    expect(wrapped).toContain("LIMIT 50");
  });
});
