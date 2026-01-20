/**
 * Test PostCard component rendering
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard } from "@/components/posts/PostCard";
import type { PostPublic } from "@/lib/schemas";

describe("PostCard", () => {
  const mockPost: PostPublic = {
    id: "post_123",
    content: "This is a test post",
    created_at: new Date("2024-01-01T12:00:00Z").toISOString(),
    author: {
      id: "user_123",
      username: "testuser",
      display_name: "Test User",
    },
  };

  it("should render post content", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("This is a test post")).toBeInTheDocument();
  });

  it("should render author display name", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should render author username with @ prefix", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("should fallback to username when no display name", () => {
    const postWithoutDisplayName: PostPublic = {
      ...mockPost,
      author: {
        ...mockPost.author,
        display_name: null,
      },
    };
    render(<PostCard post={postWithoutDisplayName} />);
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("should render author initial in avatar", () => {
    const { container } = render(<PostCard post={mockPost} />);
    expect(container.textContent).toContain("T"); // First letter of testuser
  });

  it("should render multiline content correctly", () => {
    const multilinePost: PostPublic = {
      ...mockPost,
      content: "Line 1\nLine 2\nLine 3",
    };
    render(<PostCard post={multilinePost} />);
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
  });

  it("should handle long content without overflow", () => {
    const longPost: PostPublic = {
      ...mockPost,
      content: "a".repeat(280),
    };
    const { container } = render(<PostCard post={longPost} />);
    const contentElement = container.querySelector("p");
    expect(contentElement).toHaveClass("break-words");
  });
});
