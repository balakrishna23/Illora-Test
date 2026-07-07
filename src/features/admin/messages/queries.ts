import { desc } from "drizzle-orm";

import { db } from "@/server/db/client";
import { contactMessages, vacancyRequests } from "@/server/db/schema";

export async function getAllContactMessages() {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function getAllVacancyRequests() {
  return db.select().from(vacancyRequests).orderBy(desc(vacancyRequests.createdAt));
}
