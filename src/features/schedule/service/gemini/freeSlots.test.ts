import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { computeFreeSlots } from "./freeSlots";
import { loadTestCase } from "./runner";

const here = path.dirname(fileURLToPath(import.meta.url));
const basicTestCase = loadTestCase(path.join(here, "testCases/basic.json"));

describe("computeFreeSlots", () => {
  it("basicケースで23スロットを算出する(Python版と同じ件数)", () => {
    const slots = computeFreeSlots(basicTestCase);
    expect(slots).toHaveLength(23);
  });

  it("固定予定の前後15分マージンを差し引く(ゼミ10:45開始 -> 午前枠は10:30まで)", () => {
    const slots = computeFreeSlots(basicTestCase);
    const morning = slots.find((s) => s.start === "2026-06-22T09:00:00");
    expect(morning).toBeDefined();
    expect(morning?.end).toBe("2026-06-22T10:30:00");
    expect(morning?.durationMin).toBe(90);
  });

  it("30分未満のスロットは除外する", () => {
    const slots = computeFreeSlots(basicTestCase);
    for (const slot of slots) {
      expect(slot.durationMin).toBeGreaterThanOrEqual(30);
    }
  });
});
