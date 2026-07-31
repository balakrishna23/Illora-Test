import { asc } from "drizzle-orm";

import { db } from "@/server/db/client";
import { teamMembers } from "@/server/db/schema";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  culturalConnection?: string | null;
  bio: string;
  linkedIn?: string | null;
};

export async function getTeam(): Promise<TeamMember[]> {
  return db
    .select({
      id: teamMembers.id,
      name: teamMembers.name,
      role: teamMembers.role,
      culturalConnection: teamMembers.culturalConnection,
      bio: teamMembers.bio,
      linkedIn: teamMembers.linkedIn,
    })
    .from(teamMembers)
    .orderBy(asc(teamMembers.sortOrder));
}
