import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./cinema.css";

const clash = localFont({ src: "./fonts/ClashDisplay-Variable.woff2", variable: "--font-display", display: "swap", weight: "200 700" });
const satoshi = localFont({ src: "./fonts/Satoshi-Variable.woff2", variable: "--font-body", display: "swap", weight: "300 900" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "BETWEEN | A study of being human",
  description: "An intimate, cinematic exploration of the worlds within us, and what happens when we let someone in.",
  openGraph: { title: "BETWEEN", description: "A world within. A connection between.", type: "website", images: [{ url: "/images/social.jpg", width: 1200, height: 630, alt: "BETWEEN: a study of being human" }] },
  twitter: { card: "summary_large_image", title: "BETWEEN", description: "A study of being human.", images: ["/images/social.jpg"] },
};

export const viewport: Viewport = { themeColor: "#111110", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${clash.variable} ${satoshi.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preload" as="image" href="/images/within.avif" type="image/avif" media="(min-width: 768px)" />
        <link rel="preload" as="image" href="/images/within-mobile.avif" type="image/avif" media="(max-width: 767px)" />
      </head>
      <body>{children}</body>
    </html>
  );
}
