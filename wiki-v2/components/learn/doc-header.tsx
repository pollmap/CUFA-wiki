import { Clock, BookOpenCheck } from "lucide-react";

type Props = {
  kicker?: string;
  title: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  readingMinutes?: number;
  tags?: string[];
  certifications?: string[];
  updated?: string;
};

const diffLabel: Record<NonNullable<Props["difficulty"]>, string> = {
  beginner: "초보",
  intermediate: "중급",
  advanced: "고급",
};

/**
 * 학습 문서 상단 메타 헤더. 난이도·분·태그·관련 자격증 한눈에.
 * 백준의 "문제 정보" 스트립과 같은 역할.
 */
export function DocHeader({
  kicker,
  title,
  description,
  difficulty,
  readingMinutes,
  tags = [],
  certifications = [],
  updated,
}: Props) {
  return (
    <header className="mb-8 border-b border-[color:var(--color-rule)] pb-6">
      {kicker && <p className="label-caps">{kicker}</p>}
      <h1 className="mt-2">{title}</h1>
      {description && (
        <p className="mt-3 max-w-[62ch] text-[color:var(--color-ink-soft)]">
          {description}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {difficulty && (
          <span className={`badge badge--${difficulty}`}>
            {diffLabel[difficulty]}
          </span>
        )}
        {readingMinutes && (
          <span className="flex items-center gap-1 text-[color:var(--color-ink-muted)]">
            <Clock className="h-3 w-3" strokeWidth={1.5} /> {readingMinutes}분
          </span>
        )}
        {updated && (
          <time
            className="font-mono text-[color:var(--color-ink-muted)]"
            dateTime={updated}
          >
            갱신 {updated}
          </time>
        )}
        {certifications.length > 0 && (
          <span className="flex items-center gap-1 text-[color:var(--color-ink-muted)]">
            <BookOpenCheck className="h-3 w-3" strokeWidth={1.5} />
            {certifications.join(" · ")}
          </span>
        )}
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="border border-[color:var(--color-rule)] px-2 py-0.5 text-[11px] text-[color:var(--color-ink-muted)]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
