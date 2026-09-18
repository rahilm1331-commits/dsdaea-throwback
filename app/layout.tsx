import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Throwback — Aviation & Space History",
  description: "A live multiplayer year-guessing game for aviation and space history."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}