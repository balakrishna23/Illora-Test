"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db/client";
import { teamMembers } from "@/server/db/schema";
import { requireAdmin } from "@/server/auth/session";

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().min(2, "Role is required"),
  culturalConnection: z.string().optional().or(z.literal("")),
  bio: z.string().min(10, "Bio is required"),
  linkedIn: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int(),
});

export type TeamFormState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireAdminOrError(): Promise<{ error: string } | null> {
  const session = await requireAdmin();
  return session.success ? null : { error: session.error };
}

export async function createTeamMember(
  _prev: TeamFormState | null,
  formData: FormData
): Promise<TeamFormState> {
  const denied = await requireAdminOrError();
  if (denied) return { success: false, error: denied.error };

  const parsed = teamMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(teamMembers).values({
    ...parsed.data,
    culturalConnection: parsed.data.culturalConnection || null,
    linkedIn: parsed.data.linkedIn || null,
  });

  revalidatePath("/admin/team");
  revalidatePath("/about");

  return { success: true };
}

export async function updateTeamMember(
  id: string,
  _prev: TeamFormState | null,
  formData: FormData
): Promise<TeamFormState> {
  const denied = await requireAdminOrError();
  if (denied) return { success: false, error: denied.error };

  const parsed = teamMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db
    .update(teamMembers)
    .set({
      ...parsed.data,
      culturalConnection: parsed.data.culturalConnection || null,
      linkedIn: parsed.data.linkedIn || null,
      updatedAt: new Date(),
    })
    .where(eq(teamMembers.id, id));

  revalidatePath("/admin/team");
  revalidatePath("/about");

  return { success: true };
}

export async function deleteTeamMember(id: string): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  await db.delete(teamMembers).where(eq(teamMembers.id, id));

  revalidatePath("/admin/team");
  revalidatePath("/about");

  return { success: true };
}
