/**
 * API client utilities for communicating with FastAPI backend
 * This runs on the Next.js server (BFF layer)
 */

const API_URL = process.env.API_URL || "http://localhost:8000";

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new APIError(
        error.detail || `API error: ${response.statusText}`,
        response.status,
        error
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      `Network error: ${error instanceof Error ? error.message : "Unknown"}`,
      0
    );
  }
}

// Auth API
export const authAPI = {
  async register(data: { username: string; email: string; password: string; displayName?: string; bio?: string }) {
    return fetchAPI("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(username: string, password: string) {
    return fetchAPI<{ access_token: string; token_type: string; expires_in: number }>(
      "/v1/auth/token",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    );
  },
};

// Users API
export const usersAPI = {
  async getMe(token: string) {
    return fetchAPI("/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateMe(token: string, data: { displayName?: string; bio?: string }) {
    return fetchAPI("/v1/users/me", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async getUser(userId: string) {
    return fetchAPI(`/v1/users/${userId}`, {});
  },

  async followUser(token: string, userId: string) {
    return fetchAPI(`/v1/users/me/following/${userId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async unfollowUser(token: string, userId: string) {
    return fetchAPI(`/v1/users/me/following/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getFollowers(userId: string) {
    return fetchAPI(`/v1/users/${userId}/followers`, {});
  },

  async getFollowing(userId: string) {
    return fetchAPI(`/v1/users/${userId}/following`, {});
  },
};

// Posts API
export const postsAPI = {
  async createPost(token: string, content: string) {
    return fetchAPI("/v1/posts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
  },

  async getPost(postId: string) {
    return fetchAPI(`/v1/posts/${postId}`, {});
  },

  async deletePost(token: string, postId: string) {
    return fetchAPI(`/v1/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getUserPosts(userId: string, params: { limit?: number; offset?: number } = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.offset) query.set("offset", params.offset.toString());
    const queryString = query.toString() ? `?${query.toString()}` : "";

    return fetchAPI(`/v1/posts/user/${userId}${queryString}`, {});
  },

  async getTimeline(token: string, params: { limit?: number; offset?: number } = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.offset) query.set("offset", params.offset.toString());
    const queryString = query.toString() ? `?${query.toString()}` : "";

    return fetchAPI(`/v1/posts${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
