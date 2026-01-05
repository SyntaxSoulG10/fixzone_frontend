import type { Metadata } from "next";
import { Roboto } from "next/font/google"; // Use Roboto as per Material Dashboard
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
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
      <body className={roboto.className}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
