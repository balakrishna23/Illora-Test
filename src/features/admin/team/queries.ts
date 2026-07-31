import { asc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { teamMembers } from "@/server/db/schema";

export type AdminTeamMember = typeof teamMembers.$inferSelect;

export async function getAllTeamAdmin(): Promise<AdminTeamMember[]> {
  return db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder));
}

export async function getTeamMemberByIdAdmin(id: string): Promise<AdminTeamMember | null> {
  const [row] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
  return row ?? null;
}
