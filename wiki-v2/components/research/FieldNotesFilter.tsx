"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { FieldNote } from "./FieldNotesMap";

const FieldNotesMap = dynamic(
  () => import("./FieldNotesMap").then((m) => m.FieldNotesMap),
  { ssr: false, loading: () => <MapPlaceholder /> },
);

function MapPlaceholder() {
  return (
    <div className="h-[500px] w-full rounded border border-dashed border-[color:var(--color-ink-muted)] bg-paper-dim" />
  );
}

export interface FieldNotesFilterProps {
  notes: FieldNote[];
}

export function FieldNotesFilter({ notes }: FieldNotesFilterProps) {
  const sectors = useMemo(() => {
    const s = new Set(notes.map((n) => n.sector));
    return Array.from(s).sort();
  }, [notes]);

  const years = useMemo(() => {
    const y = new Set(notes.map((n) => n.date.slice(0, 4)));
    return Array.from(y).sort().reverse();
  }, [notes]);

  const [sector, setSector] = useState<string>("all");
  const [year, setYear] = useState<string>("all");

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      if (sector !== "all" && n.sector !== sector) return false;
      if (year !== "all" && !n.date.startsWith(year)) return false;
      return true;
    });
  }, [notes, sector, year]);

  const sortedList = useMemo(() => {
    return [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="label-caps text-xs">섹터</span>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="rounded border border-[color:var(--color-ink-muted)] bg-paper-dim px-2 py-1 text-sm"
          >
            <option value="all">전체</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="label-caps text-xs">연도</span>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded border border-[color:var(--color-ink-muted)] bg-paper-dim px-2 py-1 text-sm"
          >
            <option value="all">전체</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-[color:var(--color-ink-muted)]">
          {filtered.length} / {notes.length}건
        </span>
      </div>

      <FieldNotesMap notes={filtered} />

      <ol className="flex flex-col gap-3">
        {sortedList.map((n) => (
          <li
            key={n.slug}
            className="rounded border border-[color:var(--color-ink-muted)] p-4"
          >
            <Link
              href={`/research/${n.slug}`}
              className="text-base font-semibold hover:text-[color:var(--color-vermilion)]"
            >
              {n.title}
            </Link>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-[color:var(--color-ink-muted)]">
              <span>{n.date}</span>
              <span>·</span>
              <span>{n.place}</span>
              <span>·</span>
              <span>{n.sector}</span>
            </div>
          </li>
        ))}
        {sortedList.length === 0 ? (
          <li className="rounded border border-dashed border-[color:var(--color-ink-muted)] p-6 text-center text-sm text-[color:var(--color-ink-muted)]">
            조건에 맞는 현장 노트가 없습니다.
          </li>
        ) : null}
      </ol>
    </div>
  );
}

export default FieldNotesFilter;
