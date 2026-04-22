"use client";

import { useMemo, useState } from "react";

// 3-step: ROE = (NI/Sales)·(Sales/Assets)·(Assets/Equity)
// 5-step: ROE = (NI/EBT)·(EBT/EBIT)·(EBIT/Sales)·(Sales/Assets)·(Assets/Equity)

type Mode = "3" | "5";

type Inputs = {
  ni: number;    // 당기순이익 (억원)
  ebt: number;   // 세전이익
  ebit: number;  // 영업이익
  sales: number; // 매출
  assets: number; // 총자산
  equity: number; // 자기자본
};

const INITIAL: Inputs = {
  ni: 800,
  ebt: 1100,
  ebit: 1250,
  sales: 10000,
  assets: 12000,
  equity: 5000,
};

type Bar = { label: string; value: number; color: string };

function safe(num: number, den: number): number {
  return den !== 0 ? num / den : NaN;
}

export function DuPont() {
  const [mode, setMode] = useState<Mode>("3");
  const [v, setV] = useState<Inputs>(INITIAL);

  const calc = useMemo(() => {
    const npm = safe(v.ni, v.sales);           // Net Profit Margin
    const at = safe(v.sales, v.assets);        // Asset Turnover
    const lev = safe(v.assets, v.equity);      // Equity Multiplier
    const taxBurden = safe(v.ni, v.ebt);       // NI/EBT
    const intBurden = safe(v.ebt, v.ebit);     // EBT/EBIT
    const opMargin = safe(v.ebit, v.sales);    // EBIT/Sales
    const roe3 = npm * at * lev;
    const roe5 = taxBurden * intBurden * opMargin * at * lev;
    return { npm, at, lev, taxBurden, intBurden, opMargin, roe3, roe5 };
  }, [v]);

  const roe = mode === "3" ? calc.roe3 : calc.roe5;

  const bars: Bar[] =
    mode === "3"
      ? [
          { label: "NPM · NI/Sales", value: calc.npm, color: "#c0392b" },
          { label: "AT · Sales/Assets", value: calc.at, color: "#d4a017" },
          { label: "Leverage · Assets/Equity", value: calc.lev, color: "#2c7a7b" },
        ]
      : [
          { label: "Tax Burden · NI/EBT", value: calc.taxBurden, color: "#8e44ad" },
          { label: "Interest Burden · EBT/EBIT", value: calc.intBurden, color: "#2980b9" },
          { label: "Op Margin · EBIT/Sales", value: calc.opMargin, color: "#c0392b" },
          { label: "AT · Sales/Assets", value: calc.at, color: "#d4a017" },
          { label: "Leverage · Assets/Equity", value: calc.lev, color: "#2c7a7b" },
        ];

  const fmtRatio = (n: number) =>
    Number.isFinite(n) ? n.toFixed(3) : "—";
  const fmtPct = (n: number) =>
    Number.isFinite(n) ? `${(n * 100).toFixed(2)}%` : "—";

  // Normalize bars for visual proportion (절대값 기준). 안전을 위해 epsilon 추가.
  const maxAbs = bars.reduce(
    (m, b) => (Number.isFinite(b.value) ? Math.max(m, Math.abs(b.value)) : m),
    0.0001,
  );

  return (
    <section className="not-prose my-8 border border-[color:var(--color-rule)] bg-[color:var(--color-paper)]">
      <header className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3">
        <h3 className="!mt-0 text-base font-bold">🧮 DuPont 분해 — ROE 구조 분석</h3>
        <div className="flex items-center gap-2">
          <ModeBtn active={mode === "3"} onClick={() => setMode("3")}>3단계</ModeBtn>
          <ModeBtn active={mode === "5"} onClick={() => setMode("5")}>5단계</ModeBtn>
        </div>
      </header>
      <div className="px-5 pt-4 text-sm text-[color:var(--color-ink-soft)]">
        {mode === "3" ? (
          <p>ROE = NPM × AT × Leverage = (NI/Sales) × (Sales/Assets) × (Assets/Equity)</p>
        ) : (
          <p>
            ROE = Tax Burden × Interest Burden × Op Margin × AT × Leverage =
            (NI/EBT) × (EBT/EBIT) × (EBIT/Sales) × (Sales/Assets) × (Assets/Equity)
          </p>
        )}
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div>
          <p className="label-caps mb-3">입력 (억원)</p>
          <div className="grid gap-3">
            <NumField label="당기순이익 NI" value={v.ni} onChange={(n) => setV({ ...v, ni: n })} />
            <NumField
              label="세전이익 EBT"
              value={v.ebt}
              onChange={(n) => setV({ ...v, ebt: n })}
              disabled={mode === "3"}
            />
            <NumField
              label="영업이익 EBIT"
              value={v.ebit}
              onChange={(n) => setV({ ...v, ebit: n })}
              disabled={mode === "3"}
            />
            <NumField label="매출 Sales" value={v.sales} onChange={(n) => setV({ ...v, sales: n })} />
            <NumField label="총자산 Assets" value={v.assets} onChange={(n) => setV({ ...v, assets: n })} />
            <NumField label="자기자본 Equity" value={v.equity} onChange={(n) => setV({ ...v, equity: n })} />
          </div>
        </div>
        <div>
          <p className="label-caps mb-3">분해 결과</p>
          <div className="grid gap-2">
            {bars.map((b) => {
              const widthPct =
                Number.isFinite(b.value) && maxAbs > 0
                  ? Math.min(100, (Math.abs(b.value) / maxAbs) * 100)
                  : 0;
              return (
                <div key={b.label}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[color:var(--color-ink-soft)]">{b.label}</span>
                    <span className="font-mono font-semibold">{fmtRatio(b.value)}</span>
                  </div>
                  <div className="mt-1 h-4 w-full bg-[color:var(--color-paper-soft)] border border-[color:var(--color-rule)]">
                    <div
                      style={{ width: `${widthPct}%`, backgroundColor: b.color }}
                      className="h-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 border-b-2 border-[color:var(--color-vermilion)] py-2">
            <div className="flex items-baseline justify-between">
              <dt className="text-sm font-semibold">ROE ({mode}단계)</dt>
              <dd className="font-mono text-lg font-bold text-[color:var(--color-vermilion)]">
                {fmtPct(roe)}
              </dd>
            </div>
          </div>
          {mode === "3" && (
            <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
              5단계로 전환 시 Tax/Interest Burden 분리 → 재무비용·세부담의 ROE 기여 파악 가능
            </p>
          )}
        </div>
      </div>
      <footer className="border-t border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
        기원: DuPont Corp. (1920s) · 확장형 참고: Palepu &amp; Healy, <em>Business Analysis and
        Valuation</em> ch. 5. · 주의: 은행업은 자산회전율 개념이 상이, 별도 LLR·NIM 분해 사용.
      </footer>
    </section>
  );
}

function ModeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "border px-2.5 py-1 text-xs font-semibold transition " +
        (active
          ? "border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)] text-white"
          : "border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-vermilion)]")
      }
    >
      {children}
    </button>
  );
}

function NumField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className={"block text-sm " + (disabled ? "opacity-50" : "")}>
      <span className="font-semibold">{label}</span>
      <input
        type="number"
        value={value}
        step="any"
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 block w-full border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-2.5 py-1.5 font-mono text-[color:var(--color-ink)] focus:border-[color:var(--color-vermilion)] disabled:bg-[color:var(--color-paper-soft)]"
      />
    </label>
  );
}
