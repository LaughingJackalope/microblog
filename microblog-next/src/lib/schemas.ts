/**
 * Zod schemas for runtime validation
 * This is the "ingress validation" layer - validates data coming into React
 */

import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(250).optional(),
});

// User schemas
export const userUpdateSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(250).optional(),
});

export const postAuthorSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string().nullable(),
});

export const userPublicSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  bio: z.string().nullable(),
  join_date: z.string(), // ISO 8601
  post_count: z.number(),
  follower_count: z.number(),
  following_count: z.number(),
});

// Post schemas
export const postCreateSchema = z.object({
  content: z
    .string()
    .min(1, "Post cannot be empty")
    .max(280, "Post must be at most 280 characters"),
});

export const postPublicSchema = z.object({
  id: z.string(),
  content: z.string(),
  created_at: z.string(), // ISO 8601
  author: postAuthorSchema,
});

export const postListSchema = z.object({
  posts: z.array(postPublicSchema),
  total: z.number(),
  offset: z.number(),
  limit: z.number(),
});

// Export types inferred from Zod schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostAuthor = z.infer<typeof postAuthorSchema>;
export type UserPublic = z.infer<typeof userPublicSchema>;
export type PostPublic = z.infer<typeof postPublicSchema>;
export type PostList = z.infer<typeof postListSchema>;
