/**
 * Timeline Server Component
 * Fetches posts from followed users - demonstrates colocation pattern
 */

import { postsAPI } from "@/lib/api";
import { postListSchema } from "@/lib/schemas";
import { PostCard } from "@/components/posts/PostCard";

interface TimelineProps {
  token: string;
}

export async function Timeline({ token }: TimelineProps) {
  // Data fetching colocated with the component
  const data = await postsAPI.getTimeline(token, { limit: 20 });

  // Validate with Zod (runtime safety)
  const validated = postListSchema.parse(data);

  if (validated.posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No posts yet. Follow some users or create your first post!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {validated.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
