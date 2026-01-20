/**
 * Test Server Actions for posts
 * Demonstrates testing the "BFF" layer
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPostAction } from "@/actions/posts";
import * as api from "@/lib/api";
import * as session from "@/lib/session";

// Mock the dependencies
vi.mock("@/lib/api");
vi.mock("@/lib/session");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("createPostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create post successfully", async () => {
    // Mock authenticated user
    vi.mocked(session.getCurrentUser).mockResolvedValue({
      userId: "user_123",
      username: "testuser",
      accessToken: "fake-token",
      isLoggedIn: true,
    });

    // Mock successful API response
    vi.mocked(api.postsAPI.createPost).mockResolvedValue({
      id: "post_123",
      content: "Test post",
      created_at: new Date().toISOString(),
      author: {
        id: "user_123",
        username: "testuser",
        display_name: "Test User",
      },
    });

    // Create FormData
    const formData = new FormData();
    formData.append("content", "Test post");

    // Call action
    const result = await createPostAction(null, formData);

    // Verify result
    expect(result.success).toBe(true);
    expect(result.postId).toBe("post_123");
    expect(api.postsAPI.createPost).toHaveBeenCalledWith(
      "fake-token",
      "Test post"
    );
  });

  it("should reject unauthenticated request", async () => {
    // Mock no user session
    vi.mocked(session.getCurrentUser).mockResolvedValue(null);

    const formData = new FormData();
    formData.append("content", "Test post");

    const result = await createPostAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Not authenticated");
    expect(api.postsAPI.createPost).not.toHaveBeenCalled();
  });

  it("should validate content length", async () => {
    vi.mocked(session.getCurrentUser).mockResolvedValue({
      userId: "user_123",
      username: "testuser",
      accessToken: "fake-token",
      isLoggedIn: true,
    });

    // Try to create post with content over 280 chars
    const formData = new FormData();
    formData.append("content", "a".repeat(281));

    const result = await createPostAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("280");
    expect(api.postsAPI.createPost).not.toHaveBeenCalled();
  });

  it("should validate empty content", async () => {
    vi.mocked(session.getCurrentUser).mockResolvedValue({
      userId: "user_123",
      username: "testuser",
      accessToken: "fake-token",
      isLoggedIn: true,
    });

    const formData = new FormData();
    formData.append("content", "");

    const result = await createPostAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("should handle API errors gracefully", async () => {
    vi.mocked(session.getCurrentUser).mockResolvedValue({
      userId: "user_123",
      username: "testuser",
      accessToken: "fake-token",
      isLoggedIn: true,
    });

    // Mock API error
    vi.mocked(api.postsAPI.createPost).mockRejectedValue(
      new Error("Network error")
    );

    const formData = new FormData();
    formData.append("content", "Test post");

    const result = await createPostAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Network error");
  });
});
