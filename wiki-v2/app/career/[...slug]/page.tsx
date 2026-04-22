import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { careerDocs } from "#content";
import { MDXContent } from "@/components/mdx-content";
import { Breadcrumb } from "@/components/layout/breadcrumb";

type Params = { slug: string[] };

/**
 * Velite `slug`는 track prefix를 포함한다 (예: `career/mbti/index`).
 * URL `/career/...` catch-all과 매핑 시 prefix + trailing `/index` 제거.
 */
function normalizeSlug(slug: string): string {
  return slug.replace(/^career\//, "").replace(/\/index$/, "");
}

export function generateStaticParams(): Params[] {
  return careerDocs
    .filter((d) => !d.draft)
    .map((d) => {
      const normalized = normalizeSlug(d.slug);
      return { slug: normalized === "" ? ["index"] : normalized.split("/") };
    });
}

type RouteProps = { params: Promise<Params> };

export async function generateMetadata({ params }: RouteProps) {
  const { slug: parts } = await params;
  const tail = parts.join("/");
  const doc = careerDocs.find((d) => normalizeSlug(d.slug) === tail);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function CareerDocPage({ params }: RouteProps) {
  const { slug: parts } = await params;
  const tail = parts.join("/");
  const doc = careerDocs.find((d) => normalizeSlug(d.slug) === tail);
  if (!doc || doc.draft) notFound();

  const breadcrumbSegments = [
    { label: "홈", href: "/" },
    { label: "커리어", href: "/career" },
    { label: doc.title },
  ];

  return (
    <div className="container-wide py-8">
      <Link
        href="/career"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--color-ink-muted)] no-underline hover:text-[color:var(--color-vermilion)]"
      >
        <ChevronLeft className="h-3 w-3" /> 커리어 허브
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,72ch)]">
        <article className="prose-body mx-auto w-full">
          <div className="mb-4">
            <Breadcrumb segments={breadcrumbSegments} />
          </div>

          <header className="mb-8 border-b border-[color:var(--color-rule)] pb-6">
            <p className="label-caps">{doc.section}</p>
            <h1 className="!mt-2 !mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="!mt-0 !mb-0 text-base text-[color:var(--color-ink-soft)]">
                {doc.description}
              </p>
            )}
            {doc.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {doc.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-block border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-2 py-0.5 text-[10px] font-mono text-[color:var(--color-ink-muted)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </header>

          <MDXContent code={doc.body} />
        </article>
      </div>
    </div>
  );
}
