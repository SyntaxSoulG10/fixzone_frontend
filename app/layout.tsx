import type { Metadata } from "next";
import { Roboto } from "next/font/google";
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

import { BookingProvider } from "@/context/BookingContext";
import { DashboardDataProvider } from "@/context/DashboardDataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ThemeRegistry>
          <ThemeProvider>
            <DashboardDataProvider>
              <BookingProvider>
                <Toaster position="top-right" />
                {children}
              </BookingProvider>
            </DashboardDataProvider>
          </ThemeProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
