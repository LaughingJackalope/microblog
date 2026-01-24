"use client";

/**
 * Create post form - Redesigned with Neo-Modern components
 * Uses Textarea and Button from component library
 */

import { useActionState, useEffect, useRef, useState } from "react";
import { createPostAction } from "@/actions/posts";
import { Card } from "@/components/ui";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { slideAndFade } from "@/lib/motion";

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPostAction, null);
  const [content, setContent] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = content.length;
  const maxChars = 280;
  const isNearLimit = charCount > maxChars * 0.9;
  const isOverLimit = charCount > maxChars;

  useEffect(() => {
    if (state?.success) {
      // Reset form on success
      formRef.current?.reset();
      setContent("");
      textareaRef.current?.focus();
    }
  }, [state?.success]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };

  return (
    <Card padding="relaxed">
      <form ref={formRef} action={handleSubmit} className="space-y-comfortable">
        {/* Success/Error Messages */}
        <AnimatePresence mode="wait">
          {state?.error && (
            <motion.div
              variants={slideAndFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 px-comfortable py-snug rounded-comfortable flex items-start gap-snug"
              role="alert"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-tight"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-body-sm font-medium">{state.error}</p>
            </motion.div>
          )}

          {state?.success && (
            <motion.div
              variants={slideAndFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-success-50 border-l-4 border-success-500 text-success-700 px-comfortable py-snug rounded-comfortable flex items-start gap-snug"
              role="alert"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-tight"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-body-sm font-medium">Post created successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <div className="relative">
          <label htmlFor="content" className="sr-only">
            What's on your mind?
          </label>
          <textarea
            ref={textareaRef}
            id="content"
            name="content"
            rows={3}
            maxLength={maxChars}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={isPending}
            className="w-full px-comfortable py-snug rounded-comfortable border border-border bg-surface text-ink placeholder:text-ink-whisper transition-all duration-fast ease-out focus:outline-none focus:ring-2 focus:ring-action focus:border-action disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-canvas resize-none text-body"
          />

          {/* Character count */}
          <div className="absolute bottom-snug right-snug">
            <motion.span
              className={`text-caption font-medium transition-colors duration-fast ${
                isOverLimit
                  ? "text-danger-600"
                  : isNearLimit
                  ? "text-warning-600"
                  : "text-ink-whisper"
              }`}
              animate={{
                scale: isOverLimit ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {charCount}/{maxChars}
            </motion.span>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={isPending} disabled={isPending || !content.trim()}>
            {isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
