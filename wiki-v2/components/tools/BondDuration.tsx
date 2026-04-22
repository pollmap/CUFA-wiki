"use client";

import { useMemo, useState } from "react";

/**
 * Bond Macaulay Duration + Modified Duration + Convexity 계산기.
 * D_mac = Σ(t · CF_t / (1+y)^t) / P
 * D_mod = D_mac / (1 + y/m)
 * C     = Σ(t·(t+1) · CF_t / (1+y)^(t+2)) / P
 * 가격 변화 근사: ΔP/P ≈ −D_mod · Δy + 0.5 · C · (Δy)²
 */
export function BondDuration() {
  const [face, setFace] = useState(10000);
  const [couponRate, setCouponRate] = useState(5);
  const [maturity, setMaturity] = useState(5);
  const [freq, setFreq] = useState(2);
  const [ytm, setYtm] = useState(4.5);

  const result = useMemo(
    () => computeBond({ face, couponRate, maturity, freq, ytm }),
    [face, couponRate, maturity, freq, ytm],
  );

  const scenarios: Array<{ label: string; deltaBp: number }> = [
    { label: "−200bp", deltaBp: -200 },
    { label: "−100bp", deltaBp: -100 },
    { label: "−50bp", deltaBp: -50 },
    { label: "+50bp", deltaBp: 50 },
    { label: "+100bp", deltaBp: 100 },
    { label: "+200bp", deltaBp: 200 },
  ];

  return (
    <section className="not-prose my-8 border border-[color:var(--color-rule)] bg-[color:var(--color-paper)]">
      <header className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3">
        <h3 className="!mt-0 text-base font-bold">
          🧮 Bond Duration + Convexity — 채권 금리민감도
        </h3>
        <span className="label-caps">인터랙티브</span>
      </header>

      <div className="px-5 pt-4 text-sm text-[color:var(--color-ink-soft)]">
        <p>
          Macaulay Duration, Modified Duration, Convexity를 현금흐름 할인식으로
          계산. 쿠폰은 연 m회 균등 지급, 만기에 액면가 상환. 가격 변화는
          1차(Duration) + 2차(Convexity) 테일러 근사.
        </p>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div>
          <p className="label-caps mb-3">입력</p>
          <div className="grid gap-3">
            <NumField label="액면가" unit="원" value={face} step={1000} onChange={setFace} />
            <NumField
              label="표면이자율 (coupon rate)"
              unit="%"
              value={couponRate}
              step={0.25}
              onChange={setCouponRate}
              hint="연율 표기. 반기 쿠폰이면 실제 1회 지급 = 액면×rate/m"
            />
            <NumField
              label="만기 T"
              unit="년"
              value={maturity}
              min={0.5}
              step={0.5}
              onChange={setMaturity}
            />
            <NumField
              label="쿠폰 주기"
              unit="연 m회"
              value={freq}
              min={1}
              max={12}
              step={1}
              onChange={setFreq}
              hint="반기채 m=2, 분기채 m=4, 무이표채는 coupon rate = 0"
            />
            <NumField
              label="YTM y"
              unit="%"
              value={ytm}
              step={0.1}
              onChange={setYtm}
              hint="만기수익률 (연율)"
            />
          </div>
        </div>

        <div>
          <p className="label-caps mb-3">결과</p>
          <dl className="grid gap-2">
            <OutRow label="현재 가격 P" value={fmtKRW(result.price)} />
            <OutRow label="Macaulay Duration" value={`${result.macaulay.toFixed(3)} 년`} />
            <OutRow label="Modified Duration" value={result.modified.toFixed(3)} emphasis />
            <OutRow label="Convexity" value={result.convexity.toFixed(3)} />
            <OutRow
              label="ΔP/P @ +100bp (Duration+Convexity)"
              value={`${(result.priceChange100bp * 100).toFixed(3)}%`}
              emphasis
            />
          </dl>

          <div className="mt-4">
            <p className="label-caps mb-2">가격 감응도 시나리오</p>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-[color:var(--color-rule)] text-left">
                  <th className="py-1 font-semibold">Δy</th>
                  <th className="py-1 text-right font-semibold">Duration only</th>
                  <th className="py-1 text-right font-semibold">Duration + Convexity</th>
                  <th className="py-1 text-right font-semibold">새 가격</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => {
                  const dy = s.deltaBp / 10000; // bp → decimal
                  const durOnly = -result.modified * dy;
                  const dc = durOnly + 0.5 * result.convexity * dy * dy;
                  const newPrice = result.price * (1 + dc);
                  return (
                    <tr
                      key={s.label}
                      className="border-b border-[color:var(--color-rule)]"
                    >
                      <td className="py-1 font-mono">{s.label}</td>
                      <td className="py-1 text-right font-mono">
                        {(durOnly * 100).toFixed(3)}%
                      </td>
                      <td className="py-1 text-right font-mono">
                        {(dc * 100).toFixed(3)}%
                      </td>
                      <td className="py-1 text-right font-mono">{fmtKRW(newPrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="border-t border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
        가정: (1) 만기 T는 m·T가 정수가 되도록 반올림해 현금흐름 회수를
        결정한다, (2) YTM은 연율 복리 기준, (3) Modified Duration은 1+y/m으로
        나눈다. 실무 국고채는 3개월 경과이자(accrued interest)와 day count를
        별도로 처리한다.
        <br />
        출처: Fabozzi, F. J., <em>Fixed Income Analysis</em> 3rd ed., ch. 4–5. ·
        한국 국고채 시장 호가/YTM은 KOFIA 채권정보센터 (bondweb.kofia.or.kr) 및
        KRX 채권시장 공시.
      </footer>
    </section>
  );
}

// ---------- 계산 코어 ----------

interface BondInput {
  face: number;
  couponRate: number; // %
  maturity: number; // 년
  freq: number; // 연 쿠폰 횟수
  ytm: number; // %
}

interface BondResult {
  price: number;
  macaulay: number;
  modified: number;
  convexity: number;
  /** Δy = +100bp 시 Duration + Convexity 근사 가격변화율 (decimal) */
  priceChange100bp: number;
}

function computeBond(input: BondInput): BondResult {
  const face = input.face;
  const c = input.couponRate / 100;
  const y = input.ytm / 100;
  const m = Math.max(1, Math.floor(input.freq));
  const n = Math.max(1, Math.round(input.maturity * m)); // 쿠폰 회수
  const couponPer = (face * c) / m;
  const yPer = y / m;

  let price = 0;
  let sumTCF = 0; // Σ t · CF / (1+y)^t  (t는 년단위)
  let sumTT1CF = 0; // Σ t(t+1) · CF / (1+y)^(t+2)  (t는 년단위)

  for (let k = 1; k <= n; k++) {
    const t = k / m; // 년단위 시점
    const cf = couponPer + (k === n ? face : 0);
    const discount = Math.pow(1 + yPer, k); // (1+y/m)^k 기간 단위 할인
    const pv = cf / discount;
    price += pv;
    sumTCF += t * pv;
    // Convexity 정의: Σ t(t+1) CF / (1+y)^(t+2). 연율 기준 근사:
    const convDiscount = Math.pow(1 + y, t + 2);
    sumTT1CF += (t * (t + 1) * cf) / convDiscount;
  }

  const macaulay = price > 0 ? sumTCF / price : NaN;
  const modified = price > 0 ? macaulay / (1 + yPer) : NaN;
  const convexity = price > 0 ? sumTT1CF / price : NaN;

  const dy = 0.01;
  const priceChange100bp = -modified * dy + 0.5 * convexity * dy * dy;

  return { price, macaulay, modified, convexity, priceChange100bp };
}

// ---------- UI 보조 ----------

interface NumFieldProps {
  label: string;
  unit?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  onChange: (n: number) => void;
}

function NumField({ label, unit, value, min, max, step, hint, onChange }: NumFieldProps) {
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
        min={min}
        max={max}
        step={step ?? "any"}
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

interface OutRowProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

function OutRow({ label, value, emphasis }: OutRowProps) {
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

function fmtKRW(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`;
}
