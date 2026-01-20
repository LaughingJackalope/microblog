/**
 * Home page with timeline feed
 * Demonstrates Server Components with Suspense for streaming
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Timeline } from "@/components/timeline/Timeline";
import { TimelineSkeleton } from "@/components/timeline/TimelineSkeleton";
import { CreatePostForm } from "@/components/posts/CreatePostForm";
import { Header } from "@/components/layout/Header";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Create post form - no suspense needed, renders immediately */}
          <CreatePostForm />

          {/* Timeline with Suspense - shows skeleton while loading */}
          <Suspense fallback={<TimelineSkeleton />}>
            <Timeline token={user.accessToken!} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
