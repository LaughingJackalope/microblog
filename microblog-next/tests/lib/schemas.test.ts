/**
 * Test Zod schemas for runtime validation
 * This is the "ingress" validation layer
 */

import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  postCreateSchema,
  userUpdateSchema,
  postPublicSchema,
  userPublicSchema,
} from "@/lib/schemas";

describe("Zod Schema Validation", () => {
  describe("loginSchema", () => {
    it("should accept valid login data", () => {
      const data = {
        username: "testuser",
        password: "password123",
      };
      expect(() => loginSchema.parse(data)).not.toThrow();
    });

    it("should reject empty username", () => {
      const data = {
        username: "",
        password: "password123",
      };
      expect(() => loginSchema.parse(data)).toThrow();
    });

    it("should reject empty password", () => {
      const data = {
        username: "testuser",
        password: "",
      };
      expect(() => loginSchema.parse(data)).toThrow();
    });
  });

  describe("registerSchema", () => {
    it("should accept valid registration data", () => {
      const data = {
        username: "newuser",
        email: "new@example.com",
        password: "securepass123",
      };
      expect(() => registerSchema.parse(data)).not.toThrow();
    });

    it("should reject username under 3 characters", () => {
      const data = {
        username: "ab",
        email: "test@example.com",
        password: "password123",
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });

    it("should reject username with invalid characters", () => {
      const data = {
        username: "user@name",
        email: "test@example.com",
        password: "password123",
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });

    it("should reject invalid email", () => {
      const data = {
        username: "testuser",
        email: "not-an-email",
        password: "password123",
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });

    it("should reject password under 8 characters", () => {
      const data = {
        username: "testuser",
        email: "test@example.com",
        password: "short",
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });

    it("should accept optional fields", () => {
      const data = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
        bio: "This is my bio",
      };
      expect(() => registerSchema.parse(data)).not.toThrow();
    });
  });

  describe("postCreateSchema", () => {
    it("should accept valid post content", () => {
      const data = { content: "This is a valid post" };
      expect(() => postCreateSchema.parse(data)).not.toThrow();
    });

    it("should reject empty content", () => {
      const data = { content: "" };
      expect(() => postCreateSchema.parse(data)).toThrow();
    });

    it("should reject content over 280 characters", () => {
      const data = { content: "a".repeat(281) };
      expect(() => postCreateSchema.parse(data)).toThrow();
    });

    it("should accept content at exactly 280 characters", () => {
      const data = { content: "a".repeat(280) };
      expect(() => postCreateSchema.parse(data)).not.toThrow();
    });
  });

  describe("userUpdateSchema", () => {
    it("should accept optional fields", () => {
      const data = {
        displayName: "Updated Name",
        bio: "Updated bio",
      };
      expect(() => userUpdateSchema.parse(data)).not.toThrow();
    });

    it("should accept empty object", () => {
      const data = {};
      expect(() => userUpdateSchema.parse(data)).not.toThrow();
    });

    it("should reject displayName over 100 characters", () => {
      const data = {
        displayName: "a".repeat(101),
      };
      expect(() => userUpdateSchema.parse(data)).toThrow();
    });

    it("should reject bio over 250 characters", () => {
      const data = {
        bio: "a".repeat(251),
      };
      expect(() => userUpdateSchema.parse(data)).toThrow();
    });
  });

  describe("postPublicSchema (API response validation)", () => {
    it("should accept valid post from API", () => {
      const data = {
        id: "post_123",
        content: "Test post",
        created_at: new Date().toISOString(),
        author: {
          id: "user_123",
          username: "testuser",
          display_name: "Test User",
        },
      };
      expect(() => postPublicSchema.parse(data)).not.toThrow();
    });

    it("should reject malformed post data", () => {
      const data = {
        id: "post_123",
        // Missing content
        created_at: new Date().toISOString(),
        author: {
          id: "user_123",
          username: "testuser",
          display_name: null,
        },
      };
      expect(() => postPublicSchema.parse(data)).toThrow();
    });
  });

  describe("userPublicSchema (API response validation)", () => {
    it("should accept valid user from API", () => {
      const data = {
        id: "user_123",
        username: "testuser",
        email: "test@example.com",
        display_name: "Test User",
        bio: "Test bio",
        join_date: new Date().toISOString(),
        post_count: 5,
        follower_count: 10,
        following_count: 3,
      };
      expect(() => userPublicSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid email", () => {
      const data = {
        id: "user_123",
        username: "testuser",
        email: "not-an-email",  // Invalid
        display_name: null,
        bio: null,
        join_date: new Date().toISOString(),
        post_count: 0,
        follower_count: 0,
        following_count: 0,
      };
      expect(() => userPublicSchema.parse(data)).toThrow();
    });
  });
});
