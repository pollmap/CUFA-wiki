"use client";

import { CheckCircle2 } from "lucide-react";
import { useReadDetect } from "@/lib/use-read-detect";

type Props = {
  /** 예: `learn/foundation/accounting/overview` */
  slug: string;
};

/**
 * 읽음 뱃지 — 스크롤 80%+ & 체류 2분+ 자동 인식.
 * 학습 문서 상단에 조용히 표시되며 진도는 localStorage에 영속됨.
 */
export function ReadBadge({ slug }: Props) {
  const read = useReadDetect(slug, { threshold: 0.8, minDurationSec: 120 });
  if (!read) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold"
      style={{
        borderColor: "var(--color-success)",
        color: "var(--color-success)",
      }}
      aria-label="이 문서를 읽음으로 표시됨"
    >
      <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
      읽음 완료
    </span>
  );
}
