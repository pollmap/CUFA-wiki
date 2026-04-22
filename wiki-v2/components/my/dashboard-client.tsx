"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgress, progressSummary, type ProgressState } from "@/lib/progress";

interface DashboardClientProps {
  totalDocs: number;
}

export function MyDashboardClient({ totalDocs }: DashboardClientProps) {
  const [state, setState] = useState<ProgressState | null>(null);

  useEffect(() => {
    setState(loadProgress());
  }, []);

  if (state === null) {
    return (
      <div
        aria-busy
        className="h-40 animate-pulse rounded border border-[color:var(--color-rule)] bg-paper-dim"
      />
    );
  }

  const summary = progressSummary(state, totalDocs);
  const readEntries = Object.entries(state.read)
    .sort((a, b) => (a[1].at < b[1].at ? 1 : -1))
    .slice(0, 20);
  const bookmarkEntries = Object.entries(state.bookmarked)
    .sort((a, b) => (a[1].at < b[1].at ? 1 : -1))
    .slice(0, 20);
  const quizEntries = Object.entries(state.quizAttempts).sort((a, b) =>
    a[1].at < b[1].at ? 1 : -1,
  );

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="summary">
        <h2 id="summary" className="label-caps mb-4">
          요약
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="읽은 문서" value={summary.read} total={totalDocs} />
          <StatCard label="북마크" value={summary.bookmarked} />
          <StatCard label="퀴즈 시도" value={summary.quizzes} />
          <StatCard label="진도율" value={`${summary.percent}%`} />
        </div>
      </section>

      <section aria-labelledby="reads">
        <h2 id="reads" className="label-caps mb-4">
          최근 읽음
        </h2>
        {readEntries.length === 0 ? (
          <EmptyState
            message="아직 기록된 읽음이 없습니다. 학습 문서를 열어 끝까지 스크롤하면 자동으로 기록됩니다."
            href="/learn"
            cta="학습으로 가기"
          />
        ) : (
          <ul className="divide-y divide-[color:var(--color-rule)] text-sm">
            {readEntries.map(([slug, entry]) => (
              <li key={slug} className="flex items-center justify-between py-2">
                <Link
                  href={slugToHref(slug)}
                  className="no-underline hover:text-[color:var(--color-vermilion)]"
                >
                  {slug}
                </Link>
                <span className="text-xs text-[color:var(--color-ink-muted)]">
                  {formatDate(entry.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="bookmarks">
        <h2 id="bookmarks" className="label-caps mb-4">
          북마크
        </h2>
        {bookmarkEntries.length === 0 ? (
          <EmptyState
            message="북마크한 문서가 없습니다."
            href="/learn"
            cta="학습으로 가기"
          />
        ) : (
          <ul className="divide-y divide-[color:var(--color-rule)] text-sm">
            {bookmarkEntries.map(([slug, entry]) => (
              <li key={slug} className="flex items-center justify-between py-2">
                <Link
                  href={slugToHref(slug)}
                  className="no-underline hover:text-[color:var(--color-vermilion)]"
                >
                  {slug}
                </Link>
                <span className="text-xs text-[color:var(--color-ink-muted)]">
                  {formatDate(entry.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="quizzes">
        <h2 id="quizzes" className="label-caps mb-4">
          퀴즈 기록
        </h2>
        {quizEntries.length === 0 ? (
          <EmptyState
            message="풀어본 퀴즈가 없습니다."
            href="/learn"
            cta="학습으로 가기"
          />
        ) : (
          <ul className="divide-y divide-[color:var(--color-rule)] text-sm">
            {quizEntries.map(([slug, entry]) => (
              <li key={slug} className="flex items-center justify-between py-2">
                <Link
                  href={slugToHref(slug)}
                  className="no-underline hover:text-[color:var(--color-vermilion)]"
                >
                  {slug}
                </Link>
                <span className="text-xs text-[color:var(--color-ink-muted)]">
                  {entry.correct}/{entry.total} · {formatDate(entry.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="data-mgmt"
        className="rounded border border-dashed border-[color:var(--color-rule)] p-4 text-xs text-[color:var(--color-ink-muted)]"
      >
        <h2 id="data-mgmt" className="mb-2 font-semibold text-[color:var(--color-ink)]">
          데이터 관리
        </h2>
        <p className="mb-3">
          모든 기록은 이 브라우저 localStorage(`cufa:progress:v1`)에만 저장됩니다.
          삭제하면 복구되지 않습니다.
        </p>
        <button
          type="button"
          onClick={() => {
            if (typeof window === "undefined") return;
            if (!window.confirm("학습 기록을 모두 초기화하시겠습니까?")) return;
            window.localStorage.removeItem("cufa:progress:v1");
            setState({ read: {}, bookmarked: {}, quizAttempts: {} });
          }}
          className="rounded border border-[color:var(--color-rule)] bg-paper-surface px-3 py-1 text-xs hover:border-[color:var(--color-vermilion)] hover:text-[color:var(--color-vermilion)]"
        >
          모든 기록 초기화
        </button>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
}: {
  label: string;
  value: number | string;
  total?: number;
}) {
  return (
    <div className="rounded border border-[color:var(--color-rule)] bg-paper-surface p-4">
      <div className="label-caps text-xs text-[color:var(--color-ink-muted)]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">
        {value}
        {total != null ? (
          <span className="ml-1 text-xs font-normal text-[color:var(--color-ink-muted)]">
            / {total}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({
  message,
  href,
  cta,
}: {
  message: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded border border-dashed border-[color:var(--color-rule)] p-4 text-xs text-[color:var(--color-ink-muted)]">
      <p>{message}</p>
      <Link
        href={href}
        className="mt-2 inline-block text-[color:var(--color-vermilion)] no-underline"
      >
        {cta} →
      </Link>
    </div>
  );
}

function slugToHref(slug: string): string {
  if (slug.startsWith("learn/")) return `/${slug}`;
  if (slug.startsWith("research/")) return `/${slug}`;
  if (slug.startsWith("career/")) return `/${slug}`;
  if (slug.startsWith("industries/")) return `/${slug}`;
  return `/${slug}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return iso.slice(0, 10);
  }
}
