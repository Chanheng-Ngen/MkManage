import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/app/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const kantumruyPro = localFont({
  src: "./fonts/KantumruyPro-VariableFont_wght.ttf",
  variable: "--font-kantumruy",
  display: "swap",
});

export const metadata: Metadata = {
  title: "កងយោធពលខេមរភូមិន្ទ - ប្រព័ន្ធគ្រប់គ្រងប្រវត្តិរូប",
  description: "ទិន្នន័យយោធិន និង ៩ សន្លឹកប្រវត្តិរូប",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="km"
      className={`${inter.variable} ${kantumruyPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}