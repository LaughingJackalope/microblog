/**
 * Loading state for user profile
 */

import { TimelineSkeleton } from "@/components/timeline/TimelineSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Profile skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-start space-x-4">
          <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      {/* Posts skeleton */}
      <TimelineSkeleton />
    </div>
  );
}
