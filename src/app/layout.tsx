import "@/styles/globals.css";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`font-sans ${inter.variable}`}>
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <div className="container mt-12 flex flex-col items-center justify-center gap-4 py-8">
            <Link href="/">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                <span className="text-pink-400">TV</span> Tracker
              </h1>
            </Link>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
