/**
 * Timeline Client Component
 * Handles animations and interactions for the timeline
 */
"use client";

import { PostPublic } from "@/lib/schemas";
import { PostCard } from "@/components/posts/PostCard";
import { StaggerList, StaggerItem } from "@/lib/motion";
import { EmptyTimeline } from "./EmptyTimeline";

interface TimelineClientProps {
  posts: PostPublic[];
}

export function TimelineClient({ posts }: TimelineClientProps) {
  if (posts.length === 0) {
    return <EmptyTimeline />;
  }

  return (
    <StaggerList className="space-y-comfortable" staggerDelay={0.08}>
      {posts.map((post) => (
        <StaggerItem key={post.id}>
          <PostCard post={post} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}