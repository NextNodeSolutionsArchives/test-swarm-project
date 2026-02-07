import { describe, it, expect } from "vitest";
import { successResponse, errorResponse } from "../../src/lib/auth/response";

describe("successResponse", () => {
  it("wraps data in success envelope", () => {
    const result = successResponse({ user: { id: "1" } });
    expect(result).toEqual({
      success: true,
      data: { user: { id: "1" } },
    });
  });

  it("handles null data", () => {
    const result = successResponse(null);
    expect(result).toEqual({ success: true, data: null });
  });
});

describe("errorResponse", () => {
  it("wraps error in error envelope", () => {
    const result = errorResponse("UNAUTHORIZED", "Auth required");
    expect(result).toEqual({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Auth required" },
    });
  });
});
