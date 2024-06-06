import { routes } from "@/app/safe-routes";
import Search from "@/app/search";
import { db } from "@/server/db";
import "@/styles/globals.css";
import { HomeIcon } from "lucide-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TV Tracker",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const books = await db.book.findMany({
    select: { id: true, gapiId: true },
  });
  const shows = await db.show.findMany({
    select: { id: true },
  });
  const movies = await db.movie.findMany({
    select: { id: true },
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
              <Search
                bookIds={books}
                movieIds={movies.map((media) => media.id)}
                showIds={shows.map((media) => media.id)}
              />
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
