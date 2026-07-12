import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Transit Ops | Operations Overview",
  description: "Real-time transit operations command center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", montserrat.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
