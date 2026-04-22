import { learnDocs } from "#content";

type TocItem = { label: string; href: string; order: number };
type TocSection = { label: string; items: TocItem[] };

export type AdjacentDoc = { title: string; url: string };
export type AdjacentResult = { prev?: AdjacentDoc; next?: AdjacentDoc };

const SECTION_LABELS: Record<string, string> = {
  foundation: "Ⅰ 기초 회계",
  "financial-analysis": "Ⅱ 재무분석",
  "industry-analysis": "Ⅲ 산업분석",
  "company-analysis": "Ⅳ 기업분석",
  valuation: "밸류에이션",
  macro: "거시경제",
  trading: "매매 전략",
  portfolio: "포트폴리오·리스크",
  technical: "기술적 분석",
  quant: "퀀트 시스템",
  assets: "자산별 심층",
  glossary: "용어사전",
  intro: "서론",
  curriculum: "커리큘럼",
};

function stripTrack(slug: string): string {
  return slug.replace(/^learn\//, "");
}

/**
 * Velite `learnDocs` 컬렉션을 섹션별 TOC 트리로 변환.
 * 사이드바 네비(`SidebarToc`)에 주입.
 */
export function buildLearnToc(): TocSection[] {
  const grouped = new Map<string, TocItem[]>();

  for (const doc of learnDocs) {
    if (doc.draft) continue;
    const path = stripTrack(doc.slug);
    const rootSection = path.split("/")[0] ?? "misc";
    const item: TocItem = {
      label: doc.title,
      href: `/learn/${path}`,
      order: doc.order ?? 999,
    };
    if (!grouped.has(rootSection)) grouped.set(rootSection, []);
    grouped.get(rootSection)!.push(item);
  }

  const sections: TocSection[] = [];
  for (const [slug, items] of grouped) {
    items.sort((a, b) =>
      a.order === b.order ? a.label.localeCompare(b.label, "ko") : a.order - b.order
    );
    sections.push({
      label: SECTION_LABELS[slug] ?? slug,
      items,
    });
  }
  sections.sort((a, b) => a.label.localeCompare(b.label, "ko"));
  return sections;
}

/**
 * flat 순서 (section → order → title)로 learnDocs 정렬 후
 * 주어진 slug의 prev/next 반환. slug는 stripTrack 적용된 tail과
 * velite `learn/...` 원본 둘 다 허용.
 *
 * strict mode + noUncheckedIndexedAccess 대응: 모든 배열 접근 optional chain.
 */
export function getAdjacent(slug: string): AdjacentResult {
  const target = stripTrack(slug);

  const flat = learnDocs
    .filter((d) => !d.draft)
    .map((d) => {
      const path = stripTrack(d.slug);
      const rootSection = path.split("/")[0] ?? "misc";
      return {
        path,
        title: d.title,
        url: `/learn/${path}`,
        section: rootSection,
        order: d.order ?? 999,
      };
    })
    .sort((a, b) => {
      const sectionCmp = a.section.localeCompare(b.section, "ko");
      if (sectionCmp !== 0) return sectionCmp;
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title, "ko");
    });

  const index = flat.findIndex((d) => d.path === target);
  if (index === -1) return {};

  const prevEntry = index > 0 ? flat[index - 1] : undefined;
  const nextEntry = index < flat.length - 1 ? flat[index + 1] : undefined;

  const result: AdjacentResult = {};
  if (prevEntry) result.prev = { title: prevEntry.title, url: prevEntry.url };
  if (nextEntry) result.next = { title: nextEntry.title, url: nextEntry.url };
  return result;
}
