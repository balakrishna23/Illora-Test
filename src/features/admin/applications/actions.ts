"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db/client";
import { applicationStatusValues, applications } from "@/server/db/schema";
import { requireAdmin } from "@/server/auth/session";

const statusSchema = z.enum(applicationStatusValues);

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { success: false };

  await db
    .update(applications)
    .set({ status: parsed.data, updatedAt: new Date() })
    .where(eq(applications.id, id));

  revalidatePath("/admin/applications");

  return { success: true };
}
