"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db/client";
import {
  contactMessageStatusValues,
  contactMessages,
  vacancyRequestStatusValues,
  vacancyRequests,
} from "@/server/db/schema";
import { requireAdmin } from "@/server/auth/session";

const contactStatusSchema = z.enum(contactMessageStatusValues);
const vacancyStatusSchema = z.enum(vacancyRequestStatusValues);

export async function updateContactMessageStatus(
  id: string,
  status: string
): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  const parsed = contactStatusSchema.safeParse(status);
  if (!parsed.success) return { success: false };

  await db.update(contactMessages).set({ status: parsed.data }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages/contact");

  return { success: true };
}

export async function updateVacancyRequestStatus(
  id: string,
  status: string
): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  const parsed = vacancyStatusSchema.safeParse(status);
  if (!parsed.success) return { success: false };

  await db.update(vacancyRequests).set({ status: parsed.data }).where(eq(vacancyRequests.id, id));
  revalidatePath("/admin/messages/vacancies");

  return { success: true };
}
