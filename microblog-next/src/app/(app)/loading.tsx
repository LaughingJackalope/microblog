/**
 * Loading UI for the entire app route group
 */

import { TimelineSkeleton } from "@/components/timeline/TimelineSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
        <TimelineSkeleton />
      </div>
    </div>
  );
}
