"use server";

/**
 * Server Actions for user mutations (follow/unfollow)
 */

import { revalidatePath } from "next/cache";
import { usersAPI } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

export async function followUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Check authentication
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.accessToken) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await usersAPI.followUser(currentUser.accessToken, userId);

    // Revalidate paths that show follow status
    revalidatePath(`/users/${userId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to follow user",
    };
  }
}

export async function unfollowUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Check authentication
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.accessToken) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await usersAPI.unfollowUser(currentUser.accessToken, userId);

    // Revalidate paths that show follow status
    revalidatePath(`/users/${userId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unfollow user",
    };
  }
}
