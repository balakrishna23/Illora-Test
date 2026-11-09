import { FunctionCallingConfigMode, GoogleGenAI, type FunctionDeclaration } from "@google/genai";

import { adminAssistantSql } from "@/server/db/admin-assistant-client";
import { validateReadOnlySql, wrapWithRowLimit } from "@/server/lib/sql-safety";

const MODEL = "gemini-2.5-flash";

const SCHEMA_SUMMARY = `
Tables:
- jobs(id uuid, slug text, title text, location text, state text, type text, industry text, salary_range text, posted_date text, closing_date text, status text[active|closed], created_at, updated_at)
- applications(id uuid, candidate_id uuid?, job_id uuid?, job_slug text?, job_title text?, name text, email text, phone text, target_industry text, current_role text, linked_in text?, resume_storage_key text?, cover_letter_storage_key text?, status text[submitted|under_review|interviewing|offered|rejected|withdrawn], submitted_at, updated_at)
- saved_jobs(id uuid, candidate_id uuid, job_id uuid, job_slug text, job_title text, saved_at)
- candidates(id uuid, auth_user_id uuid, email text, created_at)
- job_alerts(id uuid, email text, industry text?, state text?, job_type text?, keyword text?, status text[active|unsubscribed], created_at)
- job_alert_send_log(id uuid, job_alert_id uuid, sent_at, matched_job_ids jsonb)
- vacancy_requests(id uuid, company_name text, contact_name text, email text, phone text, role_title text, employment_type text, location text, industry text, urgency text, message text, status text[new|contacted|closed], created_at)
- contact_messages(id uuid, name text, email text, phone text?, subject text, message text, status text[new|read|replied], created_at)
`.trim();

const SYSTEM_PROMPT = `You are an internal analytics assistant for Illoura, a recruitment platform. Answer the admin's question about operational data by calling the run_sql tool with a single read-only SQL SELECT statement against the schema below. Never attempt INSERT/UPDATE/DELETE/DDL — those will be rejected. A row limit is applied for you automatically; do not add your own LIMIT unless you want fewer rows than the default.

${SCHEMA_SUMMARY}`;

const RUN_SQL_TOOL: FunctionDeclaration = {
  name: "run_sql",
  description:
    "Run a single read-only SQL SELECT statement against the Illoura database to answer the admin's question. Only SELECT/WITH statements are allowed.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "A single read-only SQL SELECT statement." },
    },
    required: ["query"],
  },
};

async function runSql(
  query: string
): Promise<{ success: true; rows: unknown[] } | { success: false; error: string }> {
  const validated = validateReadOnlySql(query);
  if (!validated.valid) {
    return { success: false, error: validated.reason };
  }

  try {
    const rows = await adminAssistantSql.begin(async (sql) => {
      await sql`SET LOCAL statement_timeout = '5s'`;
      return sql.unsafe(wrapWithRowLimit(validated.sql));
    });
    return { success: true, rows };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

function describeGeminiError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
    return "The assistant has hit Gemini's free-tier request limit. Wait about a minute and try again.";
  }
  return "The assistant is temporarily unavailable. Please try again.";
}

export async function runAdminAssistantQuery(
  question: string
): Promise<{ success: true; answer: string } | { success: false; error: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const config = {
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: [RUN_SQL_TOOL] }],
    toolConfig: {
      functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
    },
  };

  try {
    const first = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: question }] }],
      config,
    });

    const functionCall = first.functionCalls?.[0];
    if (!functionCall) {
      return { success: true, answer: first.text ?? "No answer generated." };
    }

    const { query } = functionCall.args as { query: string };
    const result = await runSql(query);

    const second = await ai.models.generateContent({
      model: MODEL,
      contents: [
        { role: "user", parts: [{ text: question }] },
        { role: "model", parts: [{ functionCall: { name: functionCall.name, args: functionCall.args } }] },
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: functionCall.name,
                response: result.success
                  ? { rows: result.rows }
                  : { error: result.error },
              },
            },
          ],
        },
      ],
      config,
    });

    return { success: true, answer: second.text ?? "No answer generated." };
  } catch (error) {
    console.error("runAdminAssistantQuery failed", error);
    return { success: false, error: describeGeminiError(error) };
  }
}
