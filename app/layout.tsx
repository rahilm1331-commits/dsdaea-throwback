import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEROQUEST — Aviation Challenge",
  description: "A live three-round aviation and space challenge."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
