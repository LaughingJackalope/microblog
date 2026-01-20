import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Microblog - Modern Full-Stack Demo",
  description: "Next.js 15 + FastAPI microblogging platform demonstrating Server Components, Server Actions, and modern patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}
