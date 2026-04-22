"use client";

import GiscusComponent from "@giscus/react";
import { useTheme } from "next-themes";

export interface DiscussionProps {
  /** 페이지 slug 또는 title — Discussion 매핑 키 (`mapping="specific"`) */
  term?: string;
  /** GitHub Discussions 카테고리 이름 override. 미지정 시 env 값 사용. */
  category?: string;
}

/**
 * GitHub Discussions 기반 댓글(Giscus).
 * - env (NEXT_PUBLIC_GISCUS_REPO / _REPO_ID / _CATEGORY / _CATEGORY_ID) 미설정 시 placeholder UI로 degrade
 * - term 제공 시 `mapping="specific"`, 미지정 시 pathname 기반
 * - next-themes resolvedTheme → noborder_light/noborder_dark 자동 매핑
 */
export function Discussion({ term, category }: DiscussionProps) {
  const { resolvedTheme } = useTheme();
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const categoryName = category ?? process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  if (!repo || !repoId || !categoryName || !categoryId) {
    return (
      <section
        aria-label="댓글 (준비 중)"
        className="my-10 rounded border border-dashed border-[color:var(--color-ink-muted)] p-4 text-xs text-[color:var(--color-ink-muted)]"
      >
        댓글 기능은 곧 열립니다. GitHub Discussions 기반(Giscus)로 운영됩니다.
      </section>
    );
  }

  return (
    <section aria-label="댓글" className="my-10">
      <GiscusComponent
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={categoryName}
        categoryId={categoryId}
        mapping={term ? "specific" : "pathname"}
        term={term}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === "dark" ? "noborder_dark" : "noborder_light"}
        lang="ko"
        loading="lazy"
      />
    </section>
  );
}
