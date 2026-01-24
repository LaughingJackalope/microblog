/**
 * Timeline Server Component - Redesigned with motion and editorial layout
 * Fetches posts from followed users - demonstrates colocation pattern
 */

import { postsAPI } from "@/lib/api";
import { postListSchema } from "@/lib/schemas";
import { TimelineClient } from "./TimelineClient";

interface TimelineProps {
  token: string;
}

export async function Timeline({ token }: TimelineProps) {
  // Data fetching colocated with the component
  const data = await postsAPI.getTimeline(token, { limit: 20 });

  // Validate with Zod (runtime safety)
  const validated = postListSchema.parse(data);

  // Pass to client component for animations
  return <TimelineClient posts={validated.posts} />;
}
