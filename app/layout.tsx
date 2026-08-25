import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
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
