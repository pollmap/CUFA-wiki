"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Search, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { primaryNav, siteMeta } from "@/lib/nav";
import { SearchBar } from "@/components/search-bar";

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * 모바일 좌측 drawer. <768px 햄버거에서 open. overlay + ESC + focus trap.
 * CLS 방지: fixed positioned, 레이아웃 영향 0.
 */
export function MobileNav({ open, onClose }: Props) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // ESC close + focus trap + body scroll lock
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    // focus close button initially
    window.setTimeout(() => firstFocusRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={
          "fixed inset-0 z-40 bg-[color:var(--color-ink)]/40 backdrop-blur-sm transition-opacity duration-200 md:hidden " +
          (open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0")
        }
      />
      {/* Drawer */}
      <div
        ref={drawerRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="주 메뉴"
        className={
          "fixed left-0 top-0 z-50 flex h-full w-[min(20rem,85vw)] flex-col border-r border-[color:var(--color-rule)] bg-[color:var(--color-paper)] transition-transform duration-200 md:hidden " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex h-14 items-center justify-between border-b border-[color:var(--color-rule)] px-4">
          <span className="font-[family-name:var(--font-sans-kr)] text-base font-black tracking-tight">
            {siteMeta.title}
          </span>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-vermilion)]"
            aria-label="메뉴 닫기"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-4">
            <SearchBar variant="compact" />
          </div>
          <nav aria-label="주 메뉴 (모바일)">
            <ul className="grid gap-0.5">
              {primaryNav.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={
                        "block rounded px-2 py-2.5 text-sm no-underline " +
                        (active
                          ? "bg-[color:var(--color-paper-soft)] font-bold text-[color:var(--color-vermilion)]"
                          : "font-bold text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-soft)]")
                      }
                    >
                      {item.label}
                      {item.hint && (
                        <span className="ml-2 text-xs font-normal text-[color:var(--color-ink-muted)]">
                          {item.hint}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex items-center justify-between border-t border-[color:var(--color-rule)] px-4 py-3">
          <span className="label-caps">테마</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="inline-flex items-center gap-1.5 rounded border border-[color:var(--color-rule)] px-2.5 py-1 text-xs text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-vermilion)] hover:text-[color:var(--color-vermilion)]"
              aria-label="테마 전환"
            >
              {resolvedTheme === "dark" ? (
                <>
                  <Sun className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>라이트</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>다크</span>
                </>
              )}
            </button>
            <Link
              href="/"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded border border-[color:var(--color-rule)] px-2.5 py-1 text-xs text-[color:var(--color-ink-soft)] no-underline hover:border-[color:var(--color-vermilion)] hover:text-[color:var(--color-vermilion)]"
              aria-label="검색"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>검색</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
