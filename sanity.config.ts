import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemaTypes";

export default defineConfig({
  name: "illora",
  title: "Illora Knowledge Hub",
  basePath: "/studio",
  projectId: projectId ?? "",
  dataset,
  apiVersion,
  schema: { types: schemaTypes },
  plugins: [structureTool()],
});
