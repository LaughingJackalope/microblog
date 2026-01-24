/**
 * Post card component - Redesigned with Neo-Modern aesthetic
 * Editorial layout with motion and semantic design tokens
 */
"use client";

import Link from "next/link";
import { PostPublic } from "@/lib/schemas";
import { useState } from "react";
import { motion } from "framer-motion";
import { HoverLift } from "@/lib/motion";

interface PostCardProps {
  post: PostPublic;
  showActions?: boolean;
}

const MAX_CHARS = 280;

export function PostCard({ post, showActions = true }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const createdAt = new Date(post.created_at);
  const timeAgo = getTimeAgo(createdAt);

  const shouldTruncate = post.content.length > MAX_CHARS;

  const getTruncatedContent = (content: string) => {
    if (content.length <= MAX_CHARS) return content;

    // Find the nearest word boundary before MAX_CHARS
    const truncated = content.slice(0, MAX_CHARS);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    // If we found a space, cut there. Otherwise just hard cut at MAX_CHARS
    const cutIndex = lastSpaceIndex > 0 ? lastSpaceIndex : MAX_CHARS;

    return content.slice(0, cutIndex) + "...";
  };

  const displayContent = !shouldTruncate || isExpanded
    ? post.content
    : getTruncatedContent(post.content);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <HoverLift distance={-2}>
      <article className="bg-surface rounded-comfortable shadow-soft border border-border p-relaxed transition-shadow duration-base hover:shadow-medium">
        <div className="flex gap-snug">
          {/* Avatar */}
          <Link href={`/users/${post.author.id}`} className="flex-shrink-0">
            <div className="h-12 w-12 rounded-round bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-surface font-bold text-body-lg shadow-soft hover:shadow-medium transition-shadow duration-fast">
              {post.author.username[0].toUpperCase()}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author info */}
            <div className="flex items-center gap-tight flex-wrap">
              <Link
                href={`/users/${post.author.id}`}
                className="font-semibold text-body text-ink hover:text-action transition-colors duration-fast hover:underline"
              >
                {post.author.display_name || post.author.username}
              </Link>
              <Link
                href={`/users/${post.author.id}`}
                className="text-body-sm text-ink-muted hover:text-ink transition-colors duration-fast hover:underline"
              >
                @{post.author.username}
              </Link>
              <span className="text-ink-whisper text-body-sm">·</span>
              <time
                dateTime={post.created_at}
                title={createdAt.toLocaleString()}
                className="text-body-sm text-ink-whisper hover:text-ink-muted transition-colors duration-fast"
              >
                {timeAgo}
              </time>
            </div>

            {/* Post content */}
            <div className="mt-snug">
              <p className="text-body text-ink whitespace-pre-wrap break-words leading-relaxed">
                {displayContent}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-tight text-body-sm text-action hover:text-action-hover font-medium transition-colors duration-fast hover:underline focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 rounded-tight px-tight"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="mt-comfortable flex items-center gap-spacious">
                {/* Like button */}
                <motion.button
                  onClick={handleLike}
                  className="group flex items-center gap-tight text-ink-muted hover:text-danger-500 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 rounded-tight px-tight py-tight -ml-tight"
                  whileTap={{ scale: 0.9 }}
                  aria-label={isLiked ? "Unlike post" : "Like post"}
                >
                  <motion.svg
                    className="w-5 h-5"
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    animate={{
                      scale: isLiked ? [1, 1.3, 1] : 1,
                      fill: isLiked ? "#ef4444" : "none",
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.68, -0.55, 0.265, 1.55],
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </motion.svg>
                  {likeCount > 0 && (
                    <motion.span
                      className="text-body-sm font-medium"
                      animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {likeCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* Reply button */}
                <motion.button
                  className="group flex items-center gap-tight text-ink-muted hover:text-info-500 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 rounded-tight px-tight py-tight"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Reply to post"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </motion.button>

                {/* Repost button */}
                <motion.button
                  className="group flex items-center gap-tight text-ink-muted hover:text-success-500 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 rounded-tight px-tight py-tight"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Repost"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </motion.button>

                {/* Share button */}
                <motion.button
                  className="group flex items-center gap-tight text-ink-muted hover:text-action transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 rounded-tight px-tight py-tight"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Share post"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </article>
    </HoverLift>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
