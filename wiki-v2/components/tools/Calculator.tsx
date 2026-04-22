"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type FieldDef = {
  key: string;
  label: string;
  /** 단위 표기 (예: "%", "원", "배"). */
  unit?: string;
  default?: number;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
};

type OutputDef = {
  key: string;
  label: string;
  format?: (n: number) => string;
  emphasis?: boolean;
};

type Props = {
  title: string;
  description?: ReactNode;
  /** 입력 필드 정의. */
  inputs: FieldDef[];
  /** 값 계산 순수 함수. 입력 맵을 받아 출력 맵 반환. */
  compute: (values: Record<string, number>) => Record<string, number>;
  /** 출력 필드 표시 순서. */
  outputs: OutputDef[];
  /** 출처/가정/한계 보조 문구. */
  notes?: ReactNode;
};

const defaultFormatter = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(2)}억`;
  if (Math.abs(n) >= 1e4) return `${(n / 1e4).toFixed(1)}만`;
  if (Math.abs(n) >= 100) return n.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 4 });
};

/**
 * 범용 계산기 셸. 각 도구 (DCF/WACC/Graham 등)는 이를 구성만 한다.
 * v1 Docusaurus의 `@site/src/components/Calculator`를 대체.
 */
export function Calculator({
  title,
  description,
  inputs,
  compute,
  outputs,
  notes,
}: Props) {
  const [state, setState] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const f of inputs) init[f.key] = f.default ?? 0;
    return init;
  });

  const results = useMemo(() => {
    try {
      return compute(state);
    } catch {
      return {};
    }
  }, [state, compute]);

  return (
    <section className="not-prose my-8 border border-[color:var(--color-rule)] bg-[color:var(--color-paper)]">
      <header className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3">
        <h3 className="!mt-0 text-base font-bold">🧮 {title}</h3>
        <span className="label-caps">인터랙티브</span>
      </header>
      {description && (
        <div className="px-5 pt-4 text-sm text-[color:var(--color-ink-soft)]">
          {description}
        </div>
      )}
      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div>
          <p className="label-caps mb-3">입력</p>
          <div className="grid gap-3">
            {inputs.map((f) => (
              <label key={f.key} className="block text-sm">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{f.label}</span>
                  {f.unit && (
                    <span className="font-mono text-xs text-[color:var(--color-ink-muted)]">
                      {f.unit}
                    </span>
                  )}
                </span>
                <input
                  type="number"
                  value={state[f.key] ?? 0}
                  min={f.min}
                  max={f.max}
                  step={f.step ?? "any"}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      [f.key]: Number(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-2.5 py-1.5 font-mono text-[color:var(--color-ink)] focus:border-[color:var(--color-vermilion)]"
                />
                {f.hint && (
                  <span className="mt-1 block text-xs text-[color:var(--color-ink-muted)]">
                    {f.hint}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="label-caps mb-3">결과</p>
          <dl className="grid gap-2">
            {outputs.map((o) => {
              const val = results[o.key];
              return (
                <div
                  key={o.key}
                  className={
                    "flex items-baseline justify-between gap-3 border-b border-[color:var(--color-rule)] py-1.5 " +
                    (o.emphasis ? "border-b-2 border-[color:var(--color-vermilion)]" : "")
                  }
                >
                  <dt className="text-sm">{o.label}</dt>
                  <dd
                    className={
                      "font-mono " +
                      (o.emphasis
                        ? "text-lg font-bold text-[color:var(--color-vermilion)]"
                        : "text-sm text-[color:var(--color-ink)]")
                    }
                  >
                    {val === undefined || Number.isNaN(val)
                      ? "—"
                      : (o.format ?? defaultFormatter)(val)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
      {notes && (
        <footer className="border-t border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
          {notes}
        </footer>
      )}
    </section>
  );
}
