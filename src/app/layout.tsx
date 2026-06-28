import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpeakFlow — 毎日10分英会話",
  description: "毎日10分、音声中心の英語アウトプット練習アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
