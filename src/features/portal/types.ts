export type ToggleSaveJobState =
  | { success: true; saved: boolean }
  | { success: false; error: string };
