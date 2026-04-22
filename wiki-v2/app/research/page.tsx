import Link from "next/link";
import { MapPin, FileText, Users } from "lucide-react";

const equityReports = [
  { slug: "kss-maritime", ticker: "KSS해운", sector: "가스선·케미컬", status: "초안" },
  { slug: "jyp", ticker: "JYP엔터테인먼트", sector: "엔터", status: "진행중" },
  { slug: "flitto", ticker: "플리토", sector: "AI 번역", status: "Phase 0" },
  { slug: "kolmar-korea", ticker: "한국콜마", sector: "화장품 ODM", status: "V11" },
  { slug: "hd-hhi", ticker: "HD현대중공업", sector: "조선", status: "Phase 1" },
];

export default function ResearchIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand-accent)]">
          리서치
        </p>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            backgroundColor: "var(--color-brand-accent-soft)",
            color: "var(--color-brand-accent)",
          }}
        >
          ★ 차별화 축
        </span>
      </div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        CUFA 5 리서치 + 254 현장 노트
      </h1>
      <p className="mt-4 max-w-2xl text-[color:var(--color-text-secondary)]">
        전국 금융 위키 중 CUFA만의 유일 자산. 대학생 애널리스트가 거제·송도·
        부산신항·코엑스를 직접 방문한 1차 데이터. AI 구조화된 실전 리서치.
      </p>

      <section className="mt-16">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-2xl font-bold">CUFA Equity Reports</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equityReports.map((r) => (
            <Link
              key={r.slug}
              href={`/research/equity/${r.slug}`}
              className="rounded-xl border p-5 hover:shadow-md"
              style={{ backgroundColor: "var(--color-bg-surface)" }}
            >
              <p className="text-lg font-semibold">{r.ticker}</p>
              <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">{r.sector}</p>
              <p
                className="mt-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: "var(--color-brand-accent-soft)",
                  color: "var(--color-brand-accent)",
                }}
              >
                {r.status}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h2 className="text-2xl font-bold">현장 노트 254회</h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          조선(거제·울산·군산) · 바이오(송도) · 물류(부산신항·평택) · 반도체
          (평택·화성) · 로봇/AI(코엑스). Phase 5에서 Mapbox GPS 맵 + 사진 + 노트 전개.
        </p>
        <Link
          href="/research/field-notes"
          className="mt-6 block rounded-xl border p-8 text-center text-sm hover:shadow-md"
          style={{ backgroundColor: "var(--color-bg-surface)" }}
        >
          🗺️ 맵 뷰 + 리스트 뷰 열기 →
        </Link>
      </section>

      <section className="mt-16">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-2xl font-bold">투자 대가</h2>
        </div>
        <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
          Graham · Buffett · Lynch · Fisher · Dalio · Marks · Greenblatt · Livermore
          + 추가: Soros · Druckenmiller · Ackman · Simons · Thorp
        </p>
      </section>
    </div>
  );
}
