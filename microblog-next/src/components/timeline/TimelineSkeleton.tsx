/**
 * Loading skeleton for timeline - Redesigned with motion
 * Shows while Server Component is fetching data
 */
"use client";

import { Pulse } from "@/lib/motion";

export function TimelineSkeleton() {
  return (
    <div className="space-y-comfortable">
      {[...Array(3)].map((_, i) => (
        <Pulse key={i}>
          <div className="bg-surface rounded-comfortable shadow-soft border border-border p-relaxed">
            <div className="flex gap-snug">
              {/* Avatar skeleton */}
              <div className="h-12 w-12 bg-border-muted rounded-round flex-shrink-0" />

              {/* Content skeleton */}
              <div className="flex-1 space-y-snug">
                {/* Author info skeleton */}
                <div className="flex items-center gap-tight">
                  <div className="h-4 w-24 bg-border-muted rounded-tight" />
                  <div className="h-4 w-20 bg-border-muted rounded-tight" />
                  <div className="h-4 w-16 bg-border-muted rounded-tight" />
                </div>

                {/* Content skeleton */}
                <div className="space-y-tight">
                  <div className="h-4 bg-border-muted rounded-tight w-full" />
                  <div className="h-4 bg-border-muted rounded-tight w-11/12" />
                  <div className="h-4 bg-border-muted rounded-tight w-4/5" />
                </div>

                {/* Actions skeleton */}
                <div className="flex items-center gap-spacious mt-comfortable">
                  <div className="h-5 w-12 bg-border-muted rounded-tight" />
                  <div className="h-5 w-12 bg-border-muted rounded-tight" />
                  <div className="h-5 w-12 bg-border-muted rounded-tight" />
                  <div className="h-5 w-12 bg-border-muted rounded-tight" />
                </div>
              </div>
            </div>
          </div>
        </Pulse>
      ))}
    </div>
  );
}
