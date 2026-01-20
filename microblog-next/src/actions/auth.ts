"use server";

/**
 * Server Actions for authentication
 * These replace traditional POST/PUT/DELETE API endpoints
 * They run on the server and can be called directly from Client Components
 */

import { redirect } from "next/navigation";
import { authAPI, usersAPI } from "@/lib/api";
import { loginSchema, registerSchema } from "@/lib/schemas";
import { getSession } from "@/lib/session";

export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  // Validate with Zod
  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Validation failed",
    };
  }

  try {
    // Call FastAPI backend
    const response = await authAPI.login(parsed.data.username, parsed.data.password);

    // Get user info
    const user = await usersAPI.getMe(response.access_token);

    // Store in session
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    session.accessToken = response.access_token;
    session.isLoggedIn = true;
    await session.save();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}

export async function registerAction(
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const rawData = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName") || undefined,
    bio: formData.get("bio") || undefined,
  };

  // Validate with Zod
  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Validation failed",
    };
  }

  try {
    // Register user
    await authAPI.register(parsed.data);

    // Auto-login after registration
    const loginResponse = await authAPI.login(parsed.data.username, parsed.data.password);
    const user = await usersAPI.getMe(loginResponse.access_token);

    // Store in session
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    session.accessToken = loginResponse.access_token;
    session.isLoggedIn = true;
    await session.save();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
