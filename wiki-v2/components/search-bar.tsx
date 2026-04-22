"use client";

import { Search, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Suggestion = { label: string; href: string; kind: string };

// 빈 쿼리 · Pagefind 미로딩 상태에서 보여주는 폴백 시드(기존 UX 유지).
const SEED_SUGGESTIONS: Suggestion[] = [
  { label: "DCF 계산기", href: "/tools/calculators/dcf", kind: "도구" },
  { label: "WACC 계산", href: "/tools/calculators/wacc", kind: "도구" },
  { label: "그레이엄 넘버", href: "/learn/valuation/graham-number", kind: "학습" },
  { label: "4-Layer 시작", href: "/learn/foundation", kind: "학습" },
  { label: "듀레이션", href: "/learn/assets/bonds/duration", kind: "채권" },
  { label: "KSS해운 리서치", href: "/research/equity/kss-maritime", kind: "리서치" },
  { label: "Finance MBTI", href: "/career/mbti", kind: "커리어" },
  { label: "투자자산운용사", href: "/career/certifications", kind: "자격증" },
  { label: "DART 공시", href: "/industries", kind: "LIVE" },
];

// Pagefind 런타임 최소 타입(런타임 스크립트는 /pagefind/pagefind.js에서 동적 로드).
type PagefindSubResult = {
  url: string;
  excerpt: string;
  meta?: { title?: string; [k: string]: unknown };
};
type PagefindHit = {
  id: string;
  data: () => Promise<PagefindSubResult>;
};
type PagefindRuntime = {
  search: (q: string) => Promise<{ results: PagefindHit[] }>;
  options?: (opts: Record<string, unknown>) => Promise<void> | void;
};

type Props = {
  /** 홈 큰 검색 · 헤더 작은 검색 크기 구분 */
  variant?: "hero" | "compact";
  placeholder?: string;
};

// 한국어 사이트 루트 기준. 정적 인덱스 위치: /pagefind/pagefind.js
const PAGEFIND_SCRIPT = "/pagefind/pagefind.js";

type SearchResult = {
  url: string;
  title: string;
  excerpt: string; // <mark> 하이라이트 포함
};

function useDebounced<T>(value: T, delay = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// 단일 동적 로드(여러 SearchBar 인스턴스 공유).
let _pagefindPromise: Promise<PagefindRuntime | null> | null = null;
function loadPagefind(): Promise<PagefindRuntime | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (_pagefindPromise) return _pagefindPromise;
  _pagefindPromise = (async () => {
    try {
      // webpackIgnore로 Next.js 번들러가 손대지 못하게 함(런타임 script).
      const mod = (await import(
        /* webpackIgnore: true */ PAGEFIND_SCRIPT
      )) as PagefindRuntime;
      if (typeof mod.options === "function") {
        await mod.options({ baseUrl: "/" });
      }
      return mod;
    } catch {
      // 개발 모드(아직 인덱스가 빌드되지 않은 상태)에서는 폴백으로 동작.
      return null;
    }
  })();
  return _pagefindPromise;
}

export function SearchBar({ variant = "compact", placeholder }: Props) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [pagefindReady, setPagefindReady] = useState(false);
  const reqSeq = useRef(0);
  const hero = variant === "hero";
  const debouncedQ = useDebounced(q, 200);

  // 포커스 시점에 pagefind 지연 로드.
  useEffect(() => {
    if (!focused || pagefindReady) return;
    let alive = true;
    loadPagefind().then((pf) => {
      if (alive && pf) setPagefindReady(true);
    });
    return () => {
      alive = false;
    };
  }, [focused, pagefindReady]);

  // 디바운스된 쿼리에 대해 실제 검색 수행.
  useEffect(() => {
    const query = debouncedQ.trim();
    if (query.length === 0) {
      setResults(null);
      setLoading(false);
      return;
    }
    const mySeq = ++reqSeq.current;
    setLoading(true);
    loadPagefind().then(async (pf) => {
      if (!pf) {
        if (mySeq === reqSeq.current) {
          setResults(null);
          setLoading(false);
        }
        return;
      }
      try {
        const res = await pf.search(query);
        const hits = await Promise.all(
          res.results.slice(0, 8).map((r) => r.data())
        );
        if (mySeq !== reqSeq.current) return;
        const mapped: SearchResult[] = hits.map((h) => ({
          url: h.url,
          title:
            (typeof h.meta?.title === "string" && h.meta.title) ||
            h.url.replace(/\/$/, "").split("/").pop() ||
            h.url,
          excerpt: h.excerpt,
        }));
        setResults(mapped);
      } catch {
        if (mySeq === reqSeq.current) setResults([]);
      } finally {
        if (mySeq === reqSeq.current) setLoading(false);
      }
    });
  }, [debouncedQ]);

  const seedMatches = useMemo<Suggestion[]>(() => {
    if (q.length === 0) return SEED_SUGGESTIONS.slice(0, 6);
    const lower = q.toLowerCase();
    return SEED_SUGGESTIONS.filter((s) =>
      s.label.toLowerCase().includes(lower)
    ).slice(0, 8);
  }, [q]);

  const onBlur = useCallback(() => {
    setTimeout(() => setFocused(false), 150);
  }, []);

  const showLiveResults = q.trim().length > 0 && results !== null;

  return (
    <div className="relative w-full">
      <label className="sr-only" htmlFor="site-search">
        검색
      </label>
      <div
        className={
          "flex items-center gap-2 border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] transition-colors focus-within:border-[color:var(--color-vermilion)] " +
          (hero ? "h-14 px-5" : "h-9 px-3")
        }
      >
        <Search
          className={hero ? "h-5 w-5" : "h-4 w-4"}
          strokeWidth={1.5}
          aria-hidden
        />
        <input
          id="site-search"
          type="search"
          data-search-input="true"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={onBlur}
          placeholder={
            placeholder ??
            (hero
              ? "문서·계산기·기업 검색 — 예: DCF, 듀레이션, KSS해운"
              : "검색")
          }
          className={
            "flex-1 bg-transparent outline-none placeholder:text-[color:var(--color-ink-muted)] " +
            (hero ? "text-base" : "text-sm")
          }
          aria-label="사이트 검색"
          autoComplete="off"
          spellCheck={false}
        />
        {loading ? (
          <Loader2
            className={
              (hero ? "h-4 w-4" : "h-3.5 w-3.5") +
              " animate-spin text-[color:var(--color-ink-muted)]"
            }
            aria-hidden
          />
        ) : (
          <span className="kbd-hint hidden md:inline">
            <kbd>/</kbd>
          </span>
        )}
      </div>
      {focused && (
        <div
          role="listbox"
          className="pagefind-results absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-auto border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] shadow-lg"
        >
          {showLiveResults ? (
            results && results.length > 0 ? (
              <ul>
                {results.map((r) => (
                  <li key={r.url}>
                    <Link
                      href={r.url}
                      className="block px-4 py-2 no-underline hover:bg-[color:var(--color-paper-soft)]"
                    >
                      <span className="block text-sm font-semibold">
                        {r.title}
                      </span>
                      <span
                        className="pagefind-excerpt mt-0.5 block text-xs text-[color:var(--color-ink-muted)]"
                        // Pagefind excerpt는 <mark> 태그만 포함(안전).
                        dangerouslySetInnerHTML={{ __html: r.excerpt }}
                      />
                      <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-[color:var(--color-ink-muted)]">
                        {r.url}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
                {loading ? "검색 중…" : "결과 없음."}
              </p>
            )
          ) : seedMatches.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
              결과 없음.
            </p>
          ) : (
            <ul>
              {seedMatches.map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    className="flex items-baseline justify-between gap-3 px-4 py-2 no-underline hover:bg-[color:var(--color-paper-soft)]"
                  >
                    <span className="text-sm font-semibold">{m.label}</span>
                    <span className="label-caps">{m.kind}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
