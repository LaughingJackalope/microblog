"use client";

/**
 * Create post form using Server Actions
 * Demonstrates progressive enhancement and optimistic updates
 */

import { useActionState, useEffect, useRef } from "react";
import { createPostAction } from "@/actions/posts";

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPostAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.success) {
      // Reset form on success
      formRef.current?.reset();
      textareaRef.current?.focus();
    }
  }, [state?.success]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <form ref={formRef} action={formAction} className="space-y-4">
        {state?.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded text-sm">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded text-sm">
            Post created successfully!
          </div>
        )}

        <div>
          <label htmlFor="content" className="sr-only">
            What's on your mind?
          </label>
          <textarea
            ref={textareaRef}
            id="content"
            name="content"
            rows={3}
            maxLength={280}
            placeholder="What's on your mind?"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            disabled={isPending}
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            280 characters max
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
