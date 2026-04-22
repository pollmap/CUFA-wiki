"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { primaryNav, siteMeta } from "@/lib/nav";
import { SearchBar } from "@/components/search-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BookMarkedIcon } from "lucide-react";

/**
 * 사이트 헤더.
 * - 데스크톱(≥md): 가로 nav + 검색 + 테마 토글
 * - 모바일(<md): 햄버거 버튼 → {@link MobileNav} drawer (focus trap + ESC + body-scroll-lock)
 *   · 경로 변경 시 drawer 자동 닫힘
 */
export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // 경로 이동 시 drawer 자동 닫힘
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-vermilion)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-paper)]";

  return (
    <header
      className="sticky top-0 z-30 border-b border-[color:var(--color-rule)]"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-paper) 92%, transparent)",
        backdropFilter: "saturate(180%) blur(6px)",
      }}
    >
      <div className="container-wide flex h-14 items-center gap-3">
        <Link
          href="/"
          className={`flex items-baseline gap-2 no-underline ${focusRing}`}
          aria-label={`${siteMeta.title} 홈으로`}
        >
          <span className="font-[family-name:var(--font-sans-kr)] text-base font-black tracking-tight">
            CUFA
          </span>
          <span className="hidden text-xs text-[color:var(--color-ink-muted)] md:inline">
            {siteMeta.subtitle}
          </span>
        </Link>

        <nav
          aria-label="주 메뉴"
          className="ml-3 hidden items-baseline gap-5 text-sm md:flex"
        >
          {primaryNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "font-[family-name:var(--font-sans-kr)] font-bold no-underline transition-colors duration-200 " +
                  focusRing +
                  " " +
                  (active
                    ? "text-[color:var(--color-vermilion)]"
                    : "text-[color:var(--color-ink)] hover:text-[color:var(--color-vermilion)]")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden w-64 md:block">
            <SearchBar variant="compact" />
          </div>
          <button
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className={`grid h-9 w-9 place-items-center rounded text-[color:var(--color-ink-soft)] transition-colors duration-200 hover:text-[color:var(--color-vermilion)] ${focusRing}`}
            aria-label="테마 전환"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
          <Link
            href="/my"
            aria-label="내 학습 기록"
            className={`hidden h-9 w-9 place-items-center rounded text-[color:var(--color-ink-soft)] transition-colors duration-200 hover:text-[color:var(--color-vermilion)] md:grid ${focusRing}`}
          >
            <BookMarkedIcon className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            className={`grid h-9 w-9 place-items-center rounded text-[color:var(--color-ink-soft)] md:hidden ${focusRing}`}
            aria-label="메뉴 열기"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
