/**
 * Test authentication Server Actions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginAction, registerAction } from "@/actions/auth";
import * as api from "@/lib/api";
import * as session from "@/lib/session";

vi.mock("@/lib/api");
vi.mock("@/lib/session");
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login successfully with valid credentials", async () => {
    // Mock API responses
    vi.mocked(api.authAPI.login).mockResolvedValue({
      access_token: "fake-jwt-token",
      token_type: "bearer",
      expires_in: 3600,
    });

    vi.mocked(api.usersAPI.getMe).mockResolvedValue({
      id: "user_123",
      username: "testuser",
      email: "test@example.com",
      display_name: null,
      bio: null,
      join_date: new Date().toISOString(),
      post_count: 0,
      follower_count: 0,
      following_count: 0,
    });

    // Mock session
    const mockSession = {
      userId: undefined,
      username: undefined,
      accessToken: undefined,
      isLoggedIn: false,
      save: vi.fn(),
      destroy: vi.fn(),
    };
    vi.mocked(session.getSession).mockResolvedValue(mockSession as any);

    // Create FormData
    const formData = new FormData();
    formData.append("username", "testuser");
    formData.append("password", "testpass123");

    const result = await loginAction(null, formData);

    expect(result.success).toBe(true);
    expect(api.authAPI.login).toHaveBeenCalledWith("testuser", "testpass123");
    expect(mockSession.save).toHaveBeenCalled();
  });

  it("should reject invalid credentials", async () => {
    vi.mocked(api.authAPI.login).mockRejectedValue(
      new Error("Incorrect username or password")
    );

    const formData = new FormData();
    formData.append("username", "testuser");
    formData.append("password", "wrongpassword");

    const result = await loginAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Incorrect");
  });

  it("should validate required fields", async () => {
    const formData = new FormData();
    formData.append("username", "");
    formData.append("password", "password123");

    const result = await loginAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe("registerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register and auto-login successfully", async () => {
    vi.mocked(api.authAPI.register).mockResolvedValue({
      id: "user_new",
      username: "newuser",
      email: "new@example.com",
      display_name: null,
      bio: null,
      join_date: new Date().toISOString(),
      post_count: 0,
      follower_count: 0,
      following_count: 0,
    });

    vi.mocked(api.authAPI.login).mockResolvedValue({
      access_token: "new-token",
      token_type: "bearer",
      expires_in: 3600,
    });

    vi.mocked(api.usersAPI.getMe).mockResolvedValue({
      id: "user_new",
      username: "newuser",
      email: "new@example.com",
      display_name: null,
      bio: null,
      join_date: new Date().toISOString(),
      post_count: 0,
      follower_count: 0,
      following_count: 0,
    });

    const mockSession = {
      save: vi.fn(),
      destroy: vi.fn(),
    };
    vi.mocked(session.getSession).mockResolvedValue(mockSession as any);

    const formData = new FormData();
    formData.append("username", "newuser");
    formData.append("email", "new@example.com");
    formData.append("password", "securepass123");

    const result = await registerAction(null, formData);

    expect(result.success).toBe(true);
    expect(api.authAPI.register).toHaveBeenCalled();
    expect(api.authAPI.login).toHaveBeenCalled();
  });

  it("should reject duplicate username", async () => {
    vi.mocked(api.authAPI.register).mockRejectedValue(
      new Error("Username already registered")
    );

    const formData = new FormData();
    formData.append("username", "existinguser");
    formData.append("email", "new@example.com");
    formData.append("password", "password123");

    const result = await registerAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("already registered");
  });
});
