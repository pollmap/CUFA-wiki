import type { Metadata } from "next";
import { MyDashboardClient } from "@/components/my/dashboard-client";
import { learnDocs, researchDocs, careerDocs, companies } from "#content";

export const metadata: Metadata = {
  title: "내 학습 기록",
  description:
    "브라우저에 저장된 나의 읽음·북마크·퀴즈 기록. 로그인 없이 localStorage에만 보관되며, 이 기기 안에서만 유지됩니다.",
};

export default function MyPage() {
  const totalDocs =
    learnDocs.filter((d) => !d.draft).length +
    researchDocs.filter((d) => !d.draft).length +
    careerDocs.filter((d) => !d.draft).length +
    companies.filter((d) => !d.draft).length;

  return (
    <div className="container-wide py-10">
      <header className="mb-8">
        <p className="label-caps">MY · 로컬 전용</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          내 학습 기록
        </h1>
        <p className="mt-3 max-w-prose text-sm text-[color:var(--color-ink-muted)]">
          이 페이지는 브라우저 localStorage에만 저장됩니다. 로그인이나 서버 동기화는 없으며,
          같은 브라우저·같은 기기 안에서만 유지되는 것으로 보입니다. 기기를 바꾸거나 브라우저
          데이터를 지우시면 기록도 함께 사라집니다. 그게 답이라고 생각합니다 —
          최소한의 프라이버시로 최대한의 기능을 유지하는 방식이죠.
        </p>
      </header>

      <MyDashboardClient totalDocs={totalDocs} />
    </div>
  );
}
