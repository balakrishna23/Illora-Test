import { defineField, defineType } from "sanity";

export const siteStats = defineType({
  name: "siteStats",
  title: "Site Stats",
  type: "document",
  // Treated as a singleton in practice — the app just takes the first
  // result. No Studio-level singleton enforcement in v1.
  fields: [
    defineField({
      name: "yearsOperating",
      title: "Years operating",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "candidatesPlaced",
      title: "Candidates placed",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "clientRetentionPct",
      title: "Client retention (%)",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "activeEmployers",
      title: "Active employers",
      type: "number",
      validation: (rule) => rule.required(),
    }),
  ],
});
