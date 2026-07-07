import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { processJobAlertDigest } from "@/features/job-alerts/queries";

function isAuthorized(request: Request): boolean {
  const secret = process.env.JOB_ALERTS_CRON_SECRET;
  // An unset secret must fail closed — comparing against `Bearer undefined`
  // would otherwise let anyone trigger the digest.
  if (!secret) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 }
    );
  }

  const { sent } = await processJobAlertDigest();

  return NextResponse.json({ sent });
}
