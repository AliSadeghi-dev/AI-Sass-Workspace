import { profileSchema } from "./profile";

describe("profileSchema", () => {
  it("accepts a valid full name", () => {
    const result = profileSchema.safeParse({ fullName: "John" });
    expect(result.success).toBe(true);
  });

  it("rejects empty full name", () => {
    const result = profileSchema.safeParse({ fullName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects names longer than 80 characters", () => {
    const result = profileSchema.safeParse({ fullName: "a".repeat(81) });
    expect(result.success).toBe(false);
  });
});
