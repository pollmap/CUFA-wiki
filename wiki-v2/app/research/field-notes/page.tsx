import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";
import { fieldNotes } from "#content";
import { FieldNotesFilter } from "@/components/research/FieldNotesFilter";
import type { FieldNote } from "@/components/research/FieldNotesMap";

export const metadata = {
  title: "현장 노트 — CUFA 리서치",
  description:
    "거제·송도·부산신항·평택·코엑스 등 CUFA 애널리스트가 직접 방문한 1차 현장 데이터.",
};

function stripTrack(slug: string): string {
  return slug.replace(/^research\//, "");
}

function toFieldNote(n: (typeof fieldNotes)[number]): FieldNote {
  return {
    slug: stripTrack(n.slug),
    title: n.title,
    lat: n.lat,
    lon: n.lon,
    place: n.place,
    date: typeof n.date === "string" ? n.date.slice(0, 10) : String(n.date).slice(0, 10),
    sector: n.sector,
  };
}

export default function FieldNotesIndexPage() {
  const notes: FieldNote[] = fieldNotes.map(toFieldNote);

  return (
    <div className="container-wide py-8">
      <Link
        href="/research"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--color-ink-muted)] no-underline hover:text-[color:var(--color-vermilion)]"
      >
        <ChevronLeft className="h-3 w-3" /> 리서치 허브
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        <h1 className="text-3xl font-bold tracking-tight">현장 노트</h1>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            backgroundColor: "var(--color-brand-accent-soft)",
            color: "var(--color-brand-accent)",
          }}
        >
          ★ 차별화 축
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-ink-muted)]">
        CUFA 애널리스트가 직접 방문한 산업 현장. 조선·바이오·물류·반도체·로봇.
        지도에서 위치를 확인하고, 리스트에서 관찰 요약을 읽어보세요.
      </p>

      <div className="mt-8">
        <FieldNotesFilter notes={notes} />
      </div>
    </div>
  );
}
