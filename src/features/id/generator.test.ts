import { describe, expect, it } from "vitest";
import { IdGenerator } from ".";

const testIdGenerator = new IdGenerator();

describe("IdGenerator", () => {
  it("重複しないIDを生成できる", () => {
    const id1 = testIdGenerator.generate<unknown>();
    const id2 = testIdGenerator.generate<unknown>();

    expect(id1).not.toBe(id2);
  });
});
