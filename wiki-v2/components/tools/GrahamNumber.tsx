"use client";

import { useMemo, useState } from "react";

// Graham = √(22.5 × EPS × BVPS) — PER ≤ 15 & PBR ≤ 1.5 (곱 ≤ 22.5) 조건에서 유도된 내재가치 상한.

type Verdict = "under" | "fair" | "over" | "na";

function classify(graham: number, price: number): Verdict {
  if (!Number.isFinite(graham) || graham <= 0 || price <= 0) return "na";
  const ratio = price / graham;
  if (ratio <= 0.85) return "under";
  if (ratio >= 1.15) return "over";
  return "fair";
}

const BADGE: Record<Verdict, { label: string; cls: string }> = {
  under: { label: "저평가 (Under)", cls: "bg-emerald-100 text-emerald-800 border-emerald-400" },
  fair: { label: "적정 (Fair)", cls: "bg-amber-100 text-amber-800 border-amber-400" },
  over: { label: "고평가 (Over)", cls: "bg-rose-100 text-rose-800 border-rose-400" },
  na: { label: "입력 대기", cls: "bg-neutral-100 text-neutral-600 border-neutral-300" },
};

export function GrahamNumber() {
  const [eps, setEps] = useState<number>(5000);
  const [bvps, setBvps] = useState<number>(40000);
  const [price, setPrice] = useState<number>(45000);

  const graham = useMemo(() => {
    const v = 22.5 * eps * bvps;
    return v > 0 ? Math.sqrt(v) : NaN;
  }, [eps, bvps]);

  const verdict = classify(graham, price);
  const badge = BADGE[verdict];
  const marginOfSafety =
    Number.isFinite(graham) && graham > 0 && price > 0
      ? ((graham - price) / graham) * 100
      : NaN;

  const fmtWon = (n: number) =>
    Number.isFinite(n) ? `${Math.round(n).toLocaleString("ko-KR")}원` : "—";

  return (
    <section className="not-prose my-8 border border-[color:var(--color-rule)] bg-[color:var(--color-paper)]">
      <header className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3">
        <h3 className="!mt-0 text-base font-bold">🧮 Graham Number — 내재가치 상한</h3>
        <span className="label-caps">인터랙티브</span>
      </header>
      <div className="px-5 pt-4 text-sm text-[color:var(--color-ink-soft)]">
        <p>
          Benjamin Graham이 제시한 방어적 투자자를 위한 내재가치 상한. PER ≤ 15 (Trailing)
          와 PBR ≤ 1.5 조건의 곱 (15 × 1.5 = 22.5)에서 유도된다.
        </p>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div>
          <p className="label-caps mb-3">입력</p>
          <div className="grid gap-3">
            <Field
              label="EPS (주당순이익, TTM)"
              unit="원"
              value={eps}
              onChange={setEps}
              hint="최근 4개 분기 합산. 일회성 이익 제외 권장"
            />
            <Field
              label="BVPS (주당순자산)"
              unit="원"
              value={bvps}
              onChange={setBvps}
              hint="최근 분기말 지배주주지분 ÷ 보통주 발행주식수"
            />
            <Field
              label="현재주가 (비교용)"
              unit="원"
              value={price}
              onChange={setPrice}
              hint="저평가/고평가 판단 기준"
            />
          </div>
        </div>
        <div>
          <p className="label-caps mb-3">결과</p>
          <dl className="grid gap-2">
            <Row label="Graham Number" value={fmtWon(graham)} emphasis />
            <Row label="안전마진 (Margin of Safety)"
              value={
                Number.isFinite(marginOfSafety)
                  ? `${marginOfSafety.toFixed(1)}%`
                  : "—"
              }
            />
          </dl>
          <div
            className={`mt-4 inline-flex items-center border px-3 py-1.5 text-sm font-semibold ${badge.cls}`}
          >
            {badge.label}
          </div>
        </div>
      </div>
      <footer className="border-t border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
        원출처: Graham, <em>The Intelligent Investor</em> (1949), ch. 14. · 주의: 저성장·저이익
        변동성 기업에만 유효. 성장주·적자 기업·금융업에는 부적합.
      </footer>
    </section>
  );
}

function Field({
  label,
  unit,
  value,
  onChange,
  hint,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{label}</span>
        {unit && (
          <span className="font-mono text-xs text-[color:var(--color-ink-muted)]">
            {unit}
          </span>
        )}
      </span>
      <input
        type="number"
        value={value}
        step="any"
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 block w-full border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-2.5 py-1.5 font-mono text-[color:var(--color-ink)] focus:border-[color:var(--color-vermilion)]"
      />
      {hint && (
        <span className="mt-1 block text-xs text-[color:var(--color-ink-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-3 border-b border-[color:var(--color-rule)] py-1.5 " +
        (emphasis ? "border-b-2 border-[color:var(--color-vermilion)]" : "")
      }
    >
      <dt className="text-sm">{label}</dt>
      <dd
        className={
          "font-mono " +
          (emphasis
            ? "text-lg font-bold text-[color:var(--color-vermilion)]"
            : "text-sm text-[color:var(--color-ink)]")
        }
      >
        {value}
      </dd>
    </div>
  );
}
