import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { learnDocs } from "#content";
import { MDXContent } from "@/components/mdx-content";
import { SidebarToc } from "@/components/learn/sidebar-toc";
import { DocHeader } from "@/components/learn/doc-header";
import { Pager } from "@/components/learn/pager";
import { ReadBadge } from "@/components/learn/read-badge";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Discussion } from "@/components/discussion/Giscus";
import { buildLearnToc, getAdjacent } from "@/lib/learn-toc";

type Params = { slug: string[] };

/**
 * Velite `slug`는 이미 track prefix를 포함한다 (예: `learn/foundation/accounting/overview`).
 * URL `/learn/...` catch-all과 매핑할 때 prefix 제거.
 */
function stripTrack(slug: string): string {
  return slug.replace(/^learn\//, "");
}

export function generateStaticParams(): Params[] {
  return learnDocs
    .filter((d) => !d.draft)
    .map((d) => ({ slug: stripTrack(d.slug).split("/") }));
}

type RouteProps = { params: Promise<Params> };

export async function generateMetadata({ params }: RouteProps) {
  const { slug: parts } = await params;
  const tail = parts.join("/");
  const doc = learnDocs.find((d) => stripTrack(d.slug) === tail);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function LearnDocPage({ params }: RouteProps) {
  const { slug: parts } = await params;
  const tail = parts.join("/");
  const doc = learnDocs.find((d) => stripTrack(d.slug) === tail);
  if (!doc || doc.draft) notFound();

  const toc = buildLearnToc();
  const adjacent = getAdjacent(doc.slug);

  const breadcrumbSegments = [
    { label: "홈", href: "/" },
    { label: "학습", href: "/learn" },
    { label: doc.section },
    { label: doc.title },
  ];

  return (
    <div className="container-wide py-8">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--color-ink-muted)] no-underline hover:text-[color:var(--color-vermilion)]"
      >
        <ChevronLeft className="h-3 w-3" /> 학습 목차
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[14rem_minmax(0,62ch)_14rem]">
        <SidebarToc sections={toc} label="학습 목차" />

        <article className="prose-body">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Breadcrumb segments={breadcrumbSegments} />
            <ReadBadge slug={doc.slug} />
          </div>
          <DocHeader
            kicker={doc.section}
            title={doc.title}
            description={doc.description}
            difficulty={doc.difficulty}
            readingMinutes={doc.readingMinutes}
            tags={doc.tags}
            certifications={doc.certifications}
            updated={doc.updated}
          />
          <MDXContent code={doc.body} />
          <Pager prev={adjacent.prev} next={adjacent.next} />
          <Discussion term={doc.slug} />
        </article>

        <aside aria-label="문서 내 목차" className="hidden lg:block">
          <div className="sticky top-20 text-xs">
            <p className="label-caps">이 페이지</p>
            <p className="mt-2 text-[color:var(--color-ink-muted)]">
              Phase 1.5에서 자동 생성된 TOC가 들어옵니다.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
