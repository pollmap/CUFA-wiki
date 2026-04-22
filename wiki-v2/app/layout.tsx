import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { KeyboardShortcuts } from "@/components/providers/keyboard-shortcuts";

export const metadata: Metadata = {
  metadataBase: new URL("https://cufa-wiki-v2.vercel.app"),
  title: {
    default: "CUFA wiki — 한국어 금융·투자 레퍼런스",
    template: "%s · CUFA wiki",
  },
  description:
    "충북대학교 가치투자학회가 만드는 한국어 금융 교육 위키. 255+ 문서, 5편 실전 리서치, 254회 현장 노트. 출처 모든 페이지 병기.",
  applicationName: "CUFA wiki",
  authors: [{ name: "CUFA — 충북대학교 가치투자학회" }],
  keywords: [
    "금융 위키",
    "CUFA",
    "가치투자",
    "DCF 계산기",
    "밸류에이션",
    "DART 공시",
    "한국은행 ECOS",
    "FRED",
    "투자자산운용사",
    "금융권 취업",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "CUFA wiki",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1015" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* UI/Display = Noto Sans KR (400/700/900), 본문 Serif = Noto Serif KR (400/700). 2 families only. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Noto+Serif+KR:wght@400;700&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[color:var(--color-ink)] focus:px-3 focus:py-2 focus:text-[color:var(--color-paper)]"
        >
          본문으로 건너뛰기
        </a>
        <ThemeProvider>
          <KeyboardShortcuts />
          <ScrollProgress />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
