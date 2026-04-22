"use client";

import { MCPQuery } from "@/components/live/MCPQuery";

/**
 * DartDisclosure — 최근 DART 공시 N건 카드 리스트
 *
 * Luxon MCP `dart_latest_disclosures` 도구를 호출해
 * 최근 공시를 공시일 · 타이틀 · 공시종류 배지로 렌더.
 * 실제 네트워크 요청은 MCPQuery(P2-A)가 책임지며, 본 컴포넌트는 shape 파싱만 담당.
 */
export interface DartDisclosureProps {
  corpCode: string;
  count?: number;
}

interface DartItem {
  rcept_dt?: string;
  report_nm?: string;
  rcept_no?: string;
  corp_name?: string;
}

interface DartPayload {
  items?: DartItem[];
}

function dartUrl(rceptNo: string | undefined): string | null {
  if (!rceptNo) return null;
  return `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${encodeURIComponent(rceptNo)}`;
}

function normalizeItems(data: unknown): DartItem[] {
  try {
    const payload = data as DartPayload | null | undefined;
    const items = payload?.items;
    if (!Array.isArray(items)) return [];
    return items;
  } catch {
    return [];
  }
}

export function DartDisclosure({ corpCode, count = 5 }: DartDisclosureProps) {
  return (
    <MCPQuery
      tool="dart_latest_disclosures"
      args={{ corp_code: corpCode, count }}
      render={(data: unknown) => {
        const items = normalizeItems(data);

        if (items.length === 0) {
          return (
            <div className="rounded-md border border-dashed p-4 text-sm text-[var(--color-ink-muted,#6b6b6b)]">
              최근 공시 없음
            </div>
          );
        }

        return (
          <ul className="flex flex-col gap-2 p-0 list-none">
            {items.slice(0, count).map((item, idx) => {
              const href = dartUrl(item.rcept_no);
              const dt = item.rcept_dt ?? "";
              const title = item.report_nm ?? "(제목 없음)";
              const kind = inferKind(item.report_nm);
              return (
                <li
                  key={item.rcept_no ?? `${idx}-${dt}`}
                  className="flex items-start gap-3 border-l-4 border-[var(--color-vermilion)] bg-[var(--color-paper-soft)] px-3 py-2 text-sm transition-colors hover:bg-[var(--color-paper-sunk)]"
                >
                  <span className="whitespace-nowrap font-mono text-xs text-[var(--color-ink-muted,#666)]">
                    {formatDate(dt)}
                  </span>
                  <span className="flex-1">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline decoration-[var(--color-vermilion-soft)] underline-offset-2 hover:decoration-[var(--color-vermilion)]"
                      >
                        {title}
                      </a>
                    ) : (
                      <span className="font-medium">{title}</span>
                    )}
                  </span>
                  <span className="whitespace-nowrap rounded-full border border-[var(--color-vermilion)] px-2 py-0.5 text-[0.7rem] uppercase tracking-wide text-[var(--color-vermilion)]">
                    {kind}
                  </span>
                </li>
              );
            })}
          </ul>
        );
      }}
    />
  );
}

function formatDate(raw: string): string {
  // DART 포맷: YYYYMMDD → YYYY-MM-DD
  if (!raw) return "";
  if (raw.length === 8 && /^\d+$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

function inferKind(reportNm: string | undefined): string {
  const n = reportNm ?? "";
  if (n.includes("분기")) return "분기";
  if (n.includes("반기")) return "반기";
  if (n.includes("사업보고서")) return "사업";
  if (n.includes("주요사항")) return "주요";
  if (n.includes("지분")) return "지분";
  if (n.includes("공시")) return "공시";
  return "기타";
}
