/**
 * Header component with navigation and user menu
 */

import Link from "next/link";
import { SessionData } from "@/lib/session";
import { LogoutButton } from "./LogoutButton";

interface HeaderProps {
  user: SessionData;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              Microblog
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Timeline
            </Link>
            <Link
              href={`/users/${user.userId}`}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              @{user.username}
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
