/**
 * Type definitions for API responses
 */

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  author: User;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
