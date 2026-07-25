import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mag 7 Tracker | Live Dashboard",
  description: "ระบบติดตามและวิเคราะห์หุ้นเทคโนโลยี Magnificent 7 แบบเรียลไทม์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning /* 💡 เพิ่มตรงนี้ที่แท็ก html ด้วยครับ */
    >
      <body 
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col`}
        suppressHydrationWarning /* 💡 คงไว้ที่ body เหมือนเดิม */
      >
        {children}
      </body>
    </html>
  );
}