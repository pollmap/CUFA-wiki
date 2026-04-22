import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { researchDocs, fieldNotes } from "#content";
import { MDXContent } from "@/components/mdx-content";
import { DocHeader } from "@/components/learn/doc-header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { StockChart } from "@/components/live/StockChart";
import { DartDisclosure } from "@/components/live/DartDisclosure";
import { Discussion } from "@/components/discussion/Giscus";

type Params = { slug: string[] };

type FieldNoteDoc = (typeof fieldNotes)[number];

function stripTrack(slug: string): string {
  return slug.replace(/^research\//, "");
}

export function generateStaticParams(): Params[] {
  const researchParams = researchDocs
    .filter((d) => !d.draft)
    .map((d) => ({ slug: stripTrack(d.slug).split("/") }));
  const fieldNoteParams = fieldNotes.map((n) => ({
    slug: stripTrack(n.slug).split("/"),
  }));
  return [...researchParams, ...fieldNoteParams];
}

type RouteProps = { params: Promise<Params> };

export async function generateMetadata({ params }: RouteProps) {
  const { slug: parts } = await params;
  const tail = parts.join("/");
  const doc = researchDocs.find((d) => stripTrack(d.slug) === tail);
  if (doc) return { title: doc.title, description: doc.description };
  const note = fieldNotes.find((n) => stripTrack(n.slug) === tail);
  if (note) return { title: note.title };
  return {};
}

function FieldNoteView({ note }: { note: FieldNoteDoc }) {
  const dateStr =
    typeof note.date === "string"
      ? note.date.slice(0, 10)
      : String(note.date).slice(0, 10);
  const segments = [
    { label: "홈", href: "/" },
    { label: "리서치", href: "/research" },
    { label: "현장 노트", href: "/research/field-notes" },
    { label: note.title },
  ];
  return (
    <div className="container-wide py-8">
      <Link
        href="/research/field-notes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--color-ink-muted)] no-underline hover:text-[color:var(--color-vermilion)]"
      >
        <ChevronLeft className="h-3 w-3" /> 현장 노트 허브
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,62ch)_20rem]">
        <article className="prose-body">
          <Breadcrumb segments={segments} />
          <header className="mb-6">
            <p className="label-caps text-xs text-[color:var(--color-ink-muted)]">
              현장 노트
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {note.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[color:var(--color-ink-muted)]">
              <span>{dateStr}</span>
              <span>·</span>
              <span>{note.place}</span>
              <span>·</span>
              <span>{note.sector}</span>
            </div>
            {note.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {note.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[color:var(--color-ink-muted)] px-2 py-0.5 text-[10px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </header>
          <MDXContent code={note.body} />
        </article>

        <aside className="flex flex-col gap-6">
          <section className="rounded border border-[color:var(--color-ink-muted)] bg-paper-dim p-4 text-sm">
            <div className="label-caps text-xs">장소</div>
            <div className="mt-1 font-medium">{note.place}</div>
            {note.lat != null && note.lon != null ? (
              <div className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
                {note.lat.toFixed(4)}, {note.lon.toFixed(4)}
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default async function ResearchDocPage({ params }: RouteProps) {
  const { slug: parts } = await params;
  const tail = parts.join("/");
  const doc = researchDocs.find((d) => stripTrack(d.slug) === tail);

  if (!doc || doc.draft) {
    const note = fieldNotes.find((n) => stripTrack(n.slug) === tail);
    if (!note) notFound();
    return <FieldNoteView note={note} />;
  }

  const segments = [
    { label: "홈", href: "/" },
    { label: "리서치", href: "/research" },
    { label: doc.section },
    { label: doc.title },
  ];

  const isEquity = doc.section === "equity" && (doc.ticker || doc.analyst);

  return (
    <div className="container-wide py-8">
      <Link
        href="/research"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--color-ink-muted)] no-underline hover:text-[color:var(--color-vermilion)]"
      >
        <ChevronLeft className="h-3 w-3" /> 리서치 허브
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,62ch)_20rem]">
        <article className="prose-body">
          <Breadcrumb segments={segments} />
          <DocHeader
            kicker={doc.section}
            title={doc.title}
            description={doc.description}
            difficulty={doc.difficulty}
            readingMinutes={doc.readingMinutes}
            tags={doc.tags}
            updated={doc.updated}
          />
          {isEquity ? (
            <div className="mb-6 grid grid-cols-2 gap-3 rounded border border-[color:var(--color-ink-muted)] bg-paper-dim p-4 text-sm">
              <div>
                <div className="label-caps text-xs">Analyst</div>
                <div>{doc.analyst ?? "—"}</div>
              </div>
              <div>
                <div className="label-caps text-xs">Rating</div>
                <div className="font-semibold">{doc.rating}</div>
              </div>
              <div>
                <div className="label-caps text-xs">Ticker</div>
                <div>{doc.ticker ?? "—"}</div>
              </div>
              <div>
                <div className="label-caps text-xs">Target Price</div>
                <div>{doc.targetPrice ?? "—"}</div>
              </div>
            </div>
          ) : null}
          <MDXContent code={doc.body} />
          <Discussion term={doc.slug} />
        </article>

        <aside className="flex flex-col gap-6">
          {doc.ticker ? (
            <>
              <section aria-labelledby="r-live-chart">
                <h3 id="r-live-chart" className="label-caps mb-3">
                  실시간 주가
                </h3>
                <StockChart ticker={doc.ticker} range="1Y" />
              </section>
              <section aria-labelledby="r-live-dart">
                <h3 id="r-live-dart" className="label-caps mb-3">
                  최근 공시
                </h3>
                <DartDisclosure corpCode={doc.ticker} count={5} />
              </section>
            </>
          ) : (
            <section className="rounded border border-dashed border-[color:var(--color-ink-muted)] p-4 text-xs text-[color:var(--color-ink-muted)]">
              이 리서치는 종목 페이지와 연동되지 않습니다.
            </section>
          )}
          {doc.fieldVisits.length > 0 ? (
            <section aria-labelledby="r-field-visits">
              <h3 id="r-field-visits" className="label-caps mb-3">
                현장 방문
              </h3>
              <ul className="space-y-2 text-sm">
                {doc.fieldVisits.map((v) => (
                  <li key={`${v.place}-${v.date}`} className="rounded border border-[color:var(--color-ink-muted)] p-2">
                    <div className="font-medium">{v.place}</div>
                    <div className="text-xs text-[color:var(--color-ink-muted)]">
                      {v.date}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
