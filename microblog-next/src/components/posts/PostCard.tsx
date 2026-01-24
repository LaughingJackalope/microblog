/**
 * Post card component
 * Can be used in both Server and Client Components
 */
"use client";

import Link from "next/link";
import { PostPublic } from "@/lib/schemas";
import { useState } from "react";

interface PostCardProps {
  post: PostPublic;
  showActions?: boolean;
}

const MAX_CHARS = 280;

export function PostCard({ post, showActions = false }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-start space-x-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
          {post.author.username[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline space-x-2">
            <Link
              href={`/users/${post.author.id}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline"
            >
              {post.author.display_name || post.author.username}
            </Link>
            <Link
              href={`/users/${post.author.id}`}
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              @{post.author.username}
            </Link>
          </div>

          <p className="mt-2 text-gray-900 dark:text-white whitespace-pre-wrap break-words">
            {displayContent}
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium focus:outline-none focus:underline"
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </p>

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={post.created_at} title={createdAt.toLocaleString()}>
              {timeAgo}
            </time>
          </div>
        </div>
      </div>
    </div>
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
