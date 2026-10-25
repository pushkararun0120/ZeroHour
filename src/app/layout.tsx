import type { Metadata, Viewport } from "next";
import {
  Noto_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Malayalam,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

// Latin text loads up front. The four Indian-script fonts are only downloaded
// when a page shows text in that script. Next.js serves all of them from this site.
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans",
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-noto-tamil",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-noto-devanagari",
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-noto-telugu",
});

const notoSansMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-noto-malayalam",
});

export const metadata: Metadata = {
  title: "ZeroHour",
  description:
    "Research prototype that turns messy emergency input into first-aid guidance and a hospital handoff summary.",
  applicationName: "ZeroHour",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F4F4F0",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSansTamil.variable} ${notoSansDevanagari.variable} ${notoSansTelugu.variable} ${notoSansMalayalam.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}