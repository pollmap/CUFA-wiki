"use client";

import { Calculator } from "./Calculator";

// Z = 1.2·A + 1.4·B + 3.3·C + 0.6·D + 1.0·E  (Altman 1968, 제조업 5-factor)

type Zone = { label: string; cls: string };

function zone(z: number): Zone {
  if (!Number.isFinite(z)) return { label: "입력 대기", cls: "bg-neutral-100 text-neutral-600 border-neutral-300" };
  if (z > 2.99) return { label: "Safe Zone (Z > 2.99)", cls: "bg-emerald-100 text-emerald-800 border-emerald-400" };
  if (z > 1.81) return { label: "Grey Zone (1.81 < Z < 2.99)", cls: "bg-amber-100 text-amber-800 border-amber-400" };
  return { label: "Distress Zone (Z < 1.81)", cls: "bg-rose-100 text-rose-800 border-rose-400" };
}

export function AltmanZ() {
  return (
    <Calculator
      title="Altman Z-Score — 부도예측 모델"
      description={
        <p>
          Edward Altman (1968) 5-factor 선형판별 모델. 제조 상장사 기준. 각 비율을
          % (0–100) 단위로 입력한다. 예: 운전자본/총자산 = 15% → 15 입력.
        </p>
      }
      inputs={[
        {
          key: "a",
          label: "A = 운전자본 / 총자산",
          unit: "%",
          default: 15,
          step: 0.5,
          hint: "Working Capital / Total Assets — 단기 유동성",
        },
        {
          key: "b",
          label: "B = 이익잉여금 / 총자산",
          unit: "%",
          default: 20,
          step: 0.5,
          hint: "Retained Earnings / Total Assets — 누적 수익성 (나이 효과)",
        },
        {
          key: "c",
          label: "C = EBIT / 총자산",
          unit: "%",
          default: 8,
          step: 0.5,
          hint: "영업이익 / 총자산 — 자산 수익성",
        },
        {
          key: "d",
          label: "D = 시가총액 / 장부상 총부채",
          unit: "%",
          default: 120,
          step: 1,
          hint: "Market Cap / Book Value of Total Liabilities — 시장 평가 안전마진",
        },
        {
          key: "e",
          label: "E = 매출 / 총자산",
          unit: "%",
          default: 90,
          step: 1,
          hint: "자산회전율 — 매출 효율성",
        },
      ]}
      outputs={[
        {
          key: "zScore",
          label: "Z-Score",
          format: (n) => (Number.isFinite(n) ? n.toFixed(2) : "—"),
          emphasis: true,
        },
        {
          key: "contribA",
          label: "A 기여도 (1.2 × A)",
          format: (n) => n.toFixed(2),
        },
        {
          key: "contribB",
          label: "B 기여도 (1.4 × B)",
          format: (n) => n.toFixed(2),
        },
        {
          key: "contribC",
          label: "C 기여도 (3.3 × C)",
          format: (n) => n.toFixed(2),
        },
        {
          key: "contribD",
          label: "D 기여도 (0.6 × D)",
          format: (n) => n.toFixed(2),
        },
        {
          key: "contribE",
          label: "E 기여도 (1.0 × E)",
          format: (n) => n.toFixed(2),
        },
      ]}
      compute={(v) => {
        // Altman 원공식은 비율 단위(x). % 입력을 비율로 환산.
        const A = (v.a ?? 0) / 100;
        const B = (v.b ?? 0) / 100;
        const C = (v.c ?? 0) / 100;
        const D = (v.d ?? 0) / 100;
        const E = (v.e ?? 0) / 100;
        const contribA = 1.2 * A;
        const contribB = 1.4 * B;
        const contribC = 3.3 * C;
        const contribD = 0.6 * D;
        const contribE = 1.0 * E;
        const zScore = contribA + contribB + contribC + contribD + contribE;
        return { zScore, contribA, contribB, contribC, contribD, contribE };
      }}
      notes={
        <ZoneFooter />
      }
    />
  );
}

function ZoneFooter() {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1 md:grid-cols-3">
        <ZoneBadge label="Safe · Z > 2.99" cls="bg-emerald-100 text-emerald-800 border-emerald-400" />
        <ZoneBadge label="Grey · 1.81–2.99" cls="bg-amber-100 text-amber-800 border-amber-400" />
        <ZoneBadge label="Distress · Z < 1.81" cls="bg-rose-100 text-rose-800 border-rose-400" />
      </div>
      <div>
        출처: Altman, <em>Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy</em>,
        Journal of Finance (1968). · 한국 적용 시: IFRS vs K-GAAP 영업이익·자산 분류 차이 주의 (특히
        리스·영업권·재평가잉여금). 비제조·비상장은 Z&apos; (Altman 1983) / Z&apos;&apos; (1993) 모델 사용.
      </div>
    </div>
  );
}

function ZoneBadge({ label, cls }: { label: string; cls: string }) {
  return (
    <div className={`border px-2 py-1 text-center text-xs font-semibold ${cls}`}>
      {label}
    </div>
  );
}
