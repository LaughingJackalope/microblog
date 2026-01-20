"use server";

/**
 * Server Actions for post mutations
 * Demonstrates the modern pattern: no fetch() calls from client!
 */

import { revalidatePath } from "next/cache";
import { postsAPI } from "@/lib/api";
import { postCreateSchema } from "@/lib/schemas";
import { getCurrentUser } from "@/lib/session";

export async function createPostAction(
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string; postId?: string }> {
  // Check authentication
  const user = await getCurrentUser();
  if (!user || !user.accessToken) {
    return { success: false, error: "Not authenticated" };
  }

  const rawData = {
    content: formData.get("content"),
  };

  // Validate with Zod
  const parsed = postCreateSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Validation failed",
    };
  }

  try {
    const post = await postsAPI.createPost(user.accessToken, parsed.data.content);

    // Revalidate the timeline and user profile
    revalidatePath("/");
    revalidatePath(`/users/${user.userId}`);

    return { success: true, postId: post.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create post",
    };
  }
}

export async function deletePostAction(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  // Check authentication
  const user = await getCurrentUser();
  if (!user || !user.accessToken) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await postsAPI.deletePost(user.accessToken, postId);

    // Revalidate the timeline and user profile
    revalidatePath("/");
    revalidatePath(`/users/${user.userId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete post",
    };
  }
}
