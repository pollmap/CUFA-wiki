import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CalcLoader } from "@/components/tools/CalcLoader";
import {
  CALC_CATEGORY_LABEL,
  CALC_REGISTRY,
  type CalcMeta,
  getCalc,
} from "@/lib/calculator-registry";

type Params = { slug: string };
type RouteProps = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return CALC_REGISTRY.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getCalc(slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
  };
}

function DifficultyBadge({ level }: { level: CalcMeta["difficulty"] }) {
  const label =
    level === "beginner"
      ? "입문"
      : level === "intermediate"
        ? "중급"
        : "심화";
  const color =
    level === "beginner"
      ? "var(--color-success)"
      : level === "intermediate"
        ? "var(--color-warning)"
        : "var(--color-vermilion)";
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        color,
      }}
      aria-label={`난이도 ${label}`}
    >
      {label} · {level}
    </span>
  );
}

export default async function CalcPage({ params }: RouteProps) {
  const { slug } = await params;
  const meta = getCalc(slug);
  if (!meta) notFound();

  const breadcrumb = [
    { label: "홈", href: "/" },
    { label: "도구", href: "/tools" },
    { label: CALC_CATEGORY_LABEL[meta.category] },
    { label: meta.title },
  ];

  return (
    <div className="container-wide py-8">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--color-ink-muted)] no-underline hover:text-[color:var(--color-vermilion)]"
      >
        <ChevronLeft className="h-3 w-3" /> 도구 목차
      </Link>

      <div className="mt-4">
        <Breadcrumb segments={breadcrumb} />
      </div>

      <article className="mt-6 max-w-3xl">
        <header aria-labelledby="calc-title" className="border-b pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-vermilion)]">
            {meta.kicker}
          </p>
          <h1
            id="calc-title"
            className="mt-2 text-3xl font-bold tracking-tight"
          >
            {meta.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--color-paper-sunk)",
                color: "var(--color-ink-soft)",
              }}
            >
              {CALC_CATEGORY_LABEL[meta.category]}
            </span>
            <DifficultyBadge level={meta.difficulty} />
          </div>
          <p className="mt-4 text-[color:var(--color-ink-soft)]">
            {meta.description}
          </p>
        </header>

        <section
          aria-labelledby="calc-formula"
          className="mt-8 rounded-md border p-4"
          style={{ backgroundColor: "var(--color-paper-soft)" }}
        >
          <h2
            id="calc-formula"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
          >
            수식 · Formula
          </h2>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm text-[color:var(--color-ink)]">
            <code>{meta.formula}</code>
          </pre>
        </section>

        <section aria-labelledby="calc-widget" className="mt-8">
          <h2
            id="calc-widget"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
          >
            계산기 · Interactive
          </h2>
          <div className="mt-3">
            <CalcLoader component={meta.component} />
          </div>
        </section>

        <section
          aria-labelledby="calc-example"
          className="mt-8 rounded-md border-l-4 pl-4"
          style={{ borderLeftColor: "var(--color-vermilion)" }}
        >
          <h2
            id="calc-example"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
          >
            활용 예 · Worked Example
          </h2>
          <p className="mt-1 text-sm font-bold text-[color:var(--color-ink)]">
            {meta.example.title}
          </p>
          <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
            {meta.example.body}
          </p>
        </section>

        {meta.related.length > 0 ? (
          <section aria-labelledby="calc-related" className="mt-10">
            <h2
              id="calc-related"
              className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
            >
              관련 학습 · Related Docs
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {meta.related.map((relSlug) => (
                <li key={relSlug}>
                  <Link
                    href={`/learn/${relSlug}`}
                    className="text-[color:var(--color-vermilion)] no-underline hover:underline"
                  >
                    /learn/{relSlug}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav
          aria-label="다른 계산기"
          className="mt-12 border-t pt-6 text-xs text-[color:var(--color-ink-muted)]"
        >
          <p className="mb-2 font-semibold uppercase tracking-wider">
            다른 계산기
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {CALC_REGISTRY.filter((c) => c.slug !== meta.slug).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/tools/calc/${c.slug}`}
                  className="no-underline hover:text-[color:var(--color-vermilion)]"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </div>
  );
}
