/**
 * User profile page
 * Demonstrates Server Component data fetching with dynamic routes
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { usersAPI, postsAPI } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { userPublicSchema, postListSchema } from "@/lib/schemas";
import { Header } from "@/components/layout/Header";
import { PostCard } from "@/components/posts/PostCard";
import { FollowButton } from "@/components/users/FollowButton";
import { TimelineSkeleton } from "@/components/timeline/TimelineSkeleton";

interface UserProfileProps {
  params: Promise<{
    userId: string;
  }>;
}

async function UserProfile({ userId, currentUserId }: { userId: string; currentUserId?: string }) {
  try {
    // Fetch user data
    const userData = await usersAPI.getUser(userId);
    const user = userPublicSchema.parse(userData);

    // Fetch user's posts
    const postsData = await postsAPI.getUserPosts(userId, { limit: 20 });
    const posts = postListSchema.parse(postsData);

    // Check if current user is following this user
    const isFollowing = false; // TODO: Implement via API call

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.display_name || user.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                {user.bio && (
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{user.bio}</p>
                )}
              </div>
            </div>

            {/* Follow button (only if viewing someone else's profile) */}
            {currentUserId && currentUserId !== userId && (
              <FollowButton userId={userId} initialIsFollowing={isFollowing} />
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 flex space-x-8 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.post_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.follower_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.following_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Posts</h2>
          {posts.posts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

export default async function UserProfilePage({ params }: UserProfileProps) {
  const { userId } = await params;
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {currentUser && <Header user={currentUser} />}

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Suspense fallback={<TimelineSkeleton />}>
          <UserProfile userId={userId} currentUserId={currentUser?.userId} />
        </Suspense>
      </main>
    </div>
  );
}
