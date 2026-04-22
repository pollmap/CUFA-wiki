import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { companies } from "#content";
import { MDXContent } from "@/components/mdx-content";
import { DocHeader } from "@/components/learn/doc-header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DartDisclosure } from "@/components/live/DartDisclosure";
import { StockChart } from "@/components/live/StockChart";

type Params = { slug: string[] };

function stripTrack(slug: string): string {
  return slug.replace(/^industries\//, "");
}

export function generateStaticParams(): Params[] {
  return companies
    .filter((d) => !d.draft)
    .map((d) => ({ slug: stripTrack(d.slug).split("/") }));
}

type RouteProps = { params: Promise<Params> };

export async function generateMetadata({ params }: RouteProps) {
  const { slug: parts } = await params;
  const tail = parts.join("/");
  const doc = companies.find((d) => stripTrack(d.slug) === tail);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function CompanyPage({ params }: RouteProps) {
  const { slug: parts } = await params;
  const tail = parts.join("/");
  const doc = companies.find((d) => stripTrack(d.slug) === tail);
  if (!doc || doc.draft) notFound();

  const segments = [
    { label: "홈", href: "/" },
    { label: "기업·산업", href: "/industries" },
    { label: doc.sector },
    { label: doc.title },
  ];

  return (
    <div className="container-wide py-8">
      <Link
        href="/industries"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--color-ink-muted)] no-underline hover:text-[color:var(--color-vermilion)]"
      >
        <ChevronLeft className="h-3 w-3" /> 기업·산업 허브
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,62ch)_20rem]">
        <article className="prose-body">
          <Breadcrumb segments={segments} />
          <DocHeader
            kicker={doc.sector}
            title={doc.title}
            description={doc.description}
            difficulty={doc.difficulty}
            readingMinutes={doc.readingMinutes}
            tags={doc.tags}
            updated={doc.updated}
          />
          <MDXContent code={doc.body} />
        </article>

        <aside className="flex flex-col gap-6">
          {doc.ticker ? (
            <section aria-labelledby="live-chart">
              <h3 id="live-chart" className="label-caps mb-3">
                실시간 주가 (Live)
              </h3>
              <StockChart ticker={doc.ticker} market={doc.market === "KOSDAQ" ? "KOSDAQ" : "KOSPI"} range="1Y" />
            </section>
          ) : null}
          {doc.corpCode ? (
            <section aria-labelledby="live-dart">
              <h3 id="live-dart" className="label-caps mb-3">
                최근 공시 (DART)
              </h3>
              <DartDisclosure corpCode={doc.corpCode} count={5} />
            </section>
          ) : null}
          {!doc.ticker && !doc.corpCode ? (
            <section className="rounded border border-dashed border-[color:var(--color-ink-muted)] p-4 text-xs text-[color:var(--color-ink-muted)]">
              이 섹터 문서는 개별 기업이 아니므로 Live 데이터는 각 기업 상세
              페이지에서 제공됩니다.
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
