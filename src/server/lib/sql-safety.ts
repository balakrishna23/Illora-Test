// Defense-in-depth validator for the admin AI assistant's SQL tool. This is
// NOT the primary control — see ADMIN_ASSISTANT_DATABASE_URL in .env.example
// for why a read-only Postgres role is the real safety boundary. Regex-based
// SQL validation is a known-weak defense class; treat this as a second layer,
// not a substitute for DB-level permissions.

const WRITE_KEYWORDS =
  /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|CREATE|COPY|MERGE|CALL|DO|EXECUTE|PREPARE|LOCK|VACUUM|LISTEN|NOTIFY|SET|COMMENT)\b/i;

export type SqlValidationResult = { valid: true; sql: string } | { valid: false; reason: string };

function stripComments(sql: string): string {
  return sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

// Validates that `rawSql` is a single, read-only SELECT/WITH statement.
// The keyword blocklist runs against the full stripped text (not just the
// top-level statement), so it also catches write keywords hidden inside a
// CTE body — e.g. `WITH x AS (INSERT ... RETURNING ...) SELECT * FROM x`.
export function validateReadOnlySql(rawSql: string): SqlValidationResult {
  const stripped = stripComments(rawSql).trim();

  if (!stripped) {
    return { valid: false, reason: "Empty query." };
  }

  const withoutTrailingSemicolon = stripped.replace(/;\s*$/, "");
  if (withoutTrailingSemicolon.includes(";")) {
    return { valid: false, reason: "Multiple statements are not allowed." };
  }

  if (!/^(SELECT|WITH)\b/i.test(withoutTrailingSemicolon)) {
    return { valid: false, reason: "Only SELECT/WITH statements are allowed." };
  }

  if (WRITE_KEYWORDS.test(withoutTrailingSemicolon)) {
    return { valid: false, reason: "Query contains a disallowed keyword." };
  }

  return { valid: true, sql: withoutTrailingSemicolon };
}

// Wraps a validated query so the row cap is enforced by us, not trusted from
// the model's own LIMIT clause.
export function wrapWithRowLimit(sql: string, limit = 200): string {
  return `SELECT * FROM (\n${sql}\n) AS _admin_assistant_subquery LIMIT ${limit}`;
}
