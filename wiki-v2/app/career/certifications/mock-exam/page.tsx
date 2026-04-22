import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MockExam } from "@/components/exam/MockExam";
import { EXAM_BANK, EXAM_SUBJECTS } from "@/lib/exam-banks";

export const metadata: Metadata = {
  title: "자격증 모의고사 — CUFA 커리어",
  description:
    "투자자산운용사 · 금융투자분석사 · CFA L1 · FRM P1 등 금융 자격증 모의고사. 60분 타이머 + 과목별 정답률 + 해설.",
};

export default function MockExamPage() {
  const totalBanked = EXAM_BANK.length;
  const subjectCount = EXAM_SUBJECTS.length;

  return (
    <div className="container-wide py-10">
      <Link
        href="/career"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--color-ink-muted)] no-underline hover:text-[color:var(--color-vermilion)]"
      >
        <ChevronLeft className="h-3 w-3" /> 커리어 허브
      </Link>

      <header className="mt-4 border-b border-[color:var(--color-rule)] pb-6">
        <p className="label-caps">certifications / mock-exam</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          자격증 모의고사
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-ink-soft)]">
          투자자산운용사 · 금융투자분석사 · 금융투자상담사 · CFA Level 1 ·
          FRM Part 1 의 핵심 개념을 60분 타이머와 함께 풀어봅니다. 문제는
          공개 제도·표준 교재 개념을 기반으로 학습용으로 재구성되었으며,
          상업 교재·기출 원문은 포함하지 않습니다.
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ink-muted)]">
          현재 {subjectCount}과목 · {totalBanked}문항 뱅크 (확장 예정)
        </p>
      </header>

      <div className="mt-10">
        <MockExam />
      </div>
    </div>
  );
}
