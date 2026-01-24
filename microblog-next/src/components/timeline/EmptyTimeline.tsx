/**
 * Empty Timeline Component
 * Beautiful empty state with illustration and CTAs
 */
"use client";

import { FadeIn } from "@/lib/motion";
import { Card } from "@/components/ui";
import Link from "next/link";

export function EmptyTimeline() {
  return (
    <FadeIn>
      <Card padding="spacious" className="text-center">
        {/* Illustration */}
        <div className="flex justify-center mb-relaxed">
          <svg
            className="w-32 h-32 text-ink-whisper"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-h3 font-bold text-ink mb-snug">
          Your timeline is quiet
        </h2>

        {/* Description */}
        <p className="text-body text-ink-muted max-w-md mx-auto mb-relaxed">
          When you follow people, their posts will appear here. Start building your network!
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-snug justify-center items-center">
          <Link
            href="/explore"
            className="inline-flex items-center justify-center px-comfortable py-snug bg-action hover:bg-action-hover text-surface font-semibold rounded-comfortable shadow-medium hover:shadow-lifted transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2"
          >
            Discover people
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center justify-center px-comfortable py-snug bg-surface hover:bg-action-muted text-ink border border-border rounded-comfortable shadow-soft hover:shadow-medium transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2"
          >
            Create a post
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-spacious pt-relaxed border-t border-border">
          <h3 className="text-body-sm font-semibold text-ink-muted mb-snug">
            Get started:
          </h3>
          <ul className="text-body-sm text-ink-muted space-y-tight max-w-sm mx-auto text-left">
            <li className="flex items-start gap-snug">
              <svg
                className="w-5 h-5 text-success-500 flex-shrink-0 mt-tight"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Share your thoughts by creating your first post</span>
            </li>
            <li className="flex items-start gap-snug">
              <svg
                className="w-5 h-5 text-info-500 flex-shrink-0 mt-tight"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Follow interesting people to see their posts</span>
            </li>
            <li className="flex items-start gap-snug">
              <svg
                className="w-5 h-5 text-accent-500 flex-shrink-0 mt-tight"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              <span>Engage with the community by liking and replying</span>
            </li>
          </ul>
        </div>
      </Card>
    </FadeIn>
  );
}