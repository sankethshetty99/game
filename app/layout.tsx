import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Scratchpad - Your Personal Notes",
  description: "A simple, persistent scratchpad for your thoughts. Your notes are automatically saved in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
