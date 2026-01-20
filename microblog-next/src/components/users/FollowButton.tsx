"use client";

/**
 * Follow/Unfollow button with optimistic updates
 * Demonstrates modern mutation patterns
 */

import { useState, useTransition } from "react";
import { followUserAction, unfollowUserAction } from "@/actions/users";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({ userId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // Optimistic update - update UI immediately
    setIsFollowing(!isFollowing);

    startTransition(async () => {
      const action = isFollowing ? unfollowUserAction : followUserAction;
      const result = await action(userId);

      if (!result.success) {
        // Revert on error
        setIsFollowing(isFollowing);
        alert(result.error || "Action failed");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {isPending ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
