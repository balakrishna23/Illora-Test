import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { updateSiteSettings } from "@/features/admin/settings/actions";
import { requireAdmin } from "@/server/auth/session";

const {
  revalidatePath,
  updateWhere,
  updateSet,
  dbUpdate,
  insertValues,
  dbInsert,
  selectLimit,
  dbSelect,
} = vi.hoisted(() => {
  const updateWhere = vi.fn();
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const dbUpdate = vi.fn(() => ({ set: updateSet }));
  const insertValues = vi.fn();
  const dbInsert = vi.fn(() => ({ values: insertValues }));
  const selectLimit = vi.fn();
  const selectFrom = vi.fn(() => ({ limit: selectLimit }));
  const dbSelect = vi.fn(() => ({ from: selectFrom }));

  return {
    revalidatePath: vi.fn(),
    updateWhere,
    updateSet,
    dbUpdate,
    insertValues,
    dbInsert,
    selectLimit,
    dbSelect,
  };
});

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/auth/session", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/server/db/client", () => ({
  db: {
    select: dbSelect,
    insert: dbInsert,
    update: dbUpdate,
  },
}));

const ADMIN = {
  success: true,
  userId: "admin-1",
  email: "admin@illouraservices.com",
} as const;

function settingsFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults = {
    yearsOperating: "12",
    candidatesPlaced: "250",
    clientRetentionPct: "92",
    activeEmployers: "38",
    ...overrides,
  };
  for (const [key, value] of Object.entries(defaults)) {
    fd.set(key, value);
  }
  return fd;
}

describe("updateSiteSettings", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockResolvedValue({ ...ADMIN });
    selectLimit.mockResolvedValue([]);
    insertValues.mockResolvedValue(undefined);
    updateWhere.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-admins", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ success: false, error: "No access." });

    const result = await updateSiteSettings(null, settingsFormData());

    expect(result).toEqual({ success: false, error: "No access." });
    expect(dbSelect).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const result = await updateSiteSettings(
      null,
      settingsFormData({ clientRetentionPct: "120", activeEmployers: "-1" })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.clientRetentionPct).toBeTruthy();
      expect(result.fieldErrors?.activeEmployers).toBeTruthy();
    }
    expect(dbSelect).not.toHaveBeenCalled();
  });

  it("inserts the singleton row when no settings exist yet", async () => {
    const result = await updateSiteSettings(null, settingsFormData());

    expect(result).toEqual({ success: true });
    expect(dbInsert).toHaveBeenCalled();
    expect(insertValues).toHaveBeenCalledWith({
      yearsOperating: 12,
      candidatesPlaced: 250,
      clientRetentionPct: 92,
      activeEmployers: 38,
    });
    expect(dbUpdate).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/settings");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("updates the existing singleton row when one already exists", async () => {
    selectLimit.mockResolvedValue([{ id: "settings-1" }]);

    const result = await updateSiteSettings(null, settingsFormData());

    expect(result).toEqual({ success: true });
    expect(dbUpdate).toHaveBeenCalled();
    expect(updateSet).toHaveBeenCalledWith({
      yearsOperating: 12,
      candidatesPlaced: 250,
      clientRetentionPct: 92,
      activeEmployers: 38,
      updatedAt: expect.any(Date),
    });
    expect(updateWhere).toHaveBeenCalled();
    expect(dbInsert).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/settings");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
