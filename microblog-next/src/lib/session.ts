/**
 * Session management using iron-session
 * Provides secure, encrypted session cookies for authentication
 */

import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  username?: string;
  accessToken?: string;
  isLoggedIn: boolean;
}

// Validate SESSION_SECRET at module load time
if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is required. Generate one with: openssl rand -base64 32"
  );
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET must be at least 32 characters long for security. Current length: " +
      process.env.SESSION_SECRET.length
  );
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "microblog_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function getCurrentUser(): Promise<SessionData | null> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }
  return {
    userId: session.userId,
    username: session.username,
    accessToken: session.accessToken,
    isLoggedIn: session.isLoggedIn,
  };
}
