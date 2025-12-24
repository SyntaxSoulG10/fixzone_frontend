import type { Metadata } from "next";
import { Outfit, Roboto } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "FixZone | Vehicle Service Management",
  description: "Modern multi-tenant platform for vehicle service centers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${roboto.variable} antialiased bg-gray-50 text-slate-900 font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
