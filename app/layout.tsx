import CurrentUser from "@/app/current-user";
import { routes } from "@/app/safe-routes";
import Search from "@/app/search";
import { CURRENT_USER_COOKIE, getCurrentUser } from "@/app/utils";
import { db } from "@/server/db";
import "@/styles/globals.css";
import { HomeIcon } from "lucide-react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TV Tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TV Tracker",
    // startUpImage: [],
  },
};

export const viewport: Viewport = {
  themeColor: "red",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUserCookie = cookies().get(CURRENT_USER_COOKIE);

  const books = await db.book.findMany({
    select: { id: true, gapiId: true },
  });
  const shows = await db.show.findMany({
    select: { id: true, tmdbId: true },
  });
  const movies = await db.movie.findMany({
    select: { id: true, tmdbId: true },
  });

  return (
    <html lang="fr">
      <body className={`font-sans ${inter.variable}`}>
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <div className="container mt-4 flex flex-col items-center justify-center gap-4 p-4">
            <div className="flex items-center justify-between pb-4 w-full">
              <Link href={routes.home()}>
                <HomeIcon />
              </Link>
              <Link href={routes.home()}>
                <h1 className="text-lg font-extrabold tracking-tight sm:text-3xl mx-4 text-center">
                  Ce que <span className="text-pink-400">Marion et Marin</span>{" "}
                  ont regardé
                </h1>
              </Link>
              <div className="flex items-center">
                <CurrentUser
                  currentUserCookie={getCurrentUser(currentUserCookie?.value)}
                />
                <Search bookIds={books} movieIds={movies} showIds={shows} />
              </div>
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
