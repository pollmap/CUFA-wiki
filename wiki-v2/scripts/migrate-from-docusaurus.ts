#!/usr/bin/env tsx
/**
 * Docusaurus v1 wiki/docs → Next.js v2 content/ 마이그레이션 스크립트 (dry-run by default).
 *
 * 무엇을 하나:
 *   1. `../wiki/docs/**` 스캔
 *   2. front matter 파싱 (sidebar_position → order, 등)
 *   3. v2 IA(Learn/Industries/Career/Research)로 경로 매핑
 *   4. 내부 링크 재작성 (`/docs/x/y` → `/learn/x/y` 등)
 *   5. Docusaurus 특수 import (`@theme/...`, `@site/...`) 제거/치환 리스트 보고
 *   6. `../wiki-v2/content/<track>/<...>/<slug>.mdx` 생성 (APPLY 시)
 *
 * 실행:
 *   tsx scripts/migrate-from-docusaurus.ts           # dry-run, 리포트만
 *   tsx scripts/migrate-from-docusaurus.ts --apply   # 실제 파일 쓰기
 *   tsx scripts/migrate-from-docusaurus.ts --only=foundation,assets
 */

import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(__dirname, "..");
const V1_DOCS = resolve(V2_ROOT, "../wiki/docs");
const V2_CONTENT = resolve(V2_ROOT, "content");

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const ONLY = [...args]
  .find((a) => a.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",")
  .filter(Boolean);

// ── v1 카테고리 → v2 트랙/섹션 매핑 ──────────────────────────────
type Mapping = { track: string; section: string };

const DIR_MAP: Record<string, Mapping> = {
  foundation: { track: "learn", section: "foundation" },
  "financial-analysis": { track: "learn", section: "financial-analysis" },
  "industry-analysis": { track: "learn", section: "industry-analysis" },
  "company-analysis": { track: "learn", section: "company-analysis" },
  valuation: { track: "learn", section: "valuation" },
  macroeconomics: { track: "learn", section: "macro" },
  "trading-strategies": { track: "learn", section: "trading" },
  "risk-management": { track: "learn", section: "portfolio" },
  technical: { track: "learn", section: "technical" },
  "quant-system": { track: "learn", section: "quant" },
  "modeling-tools": { track: "tools", section: "modeling" },
  calculators: { track: "tools", section: "calculators" },
  quiz: { track: "tools", section: "quiz" },
  glossary: { track: "learn", section: "glossary" },
  masters: { track: "research", section: "masters" },
  "case-studies": { track: "research", section: "case-studies" },
  "assets/bonds": { track: "learn", section: "assets/bonds" },
  "assets/crypto": { track: "learn", section: "assets/crypto" },
  "assets/derivatives": { track: "learn", section: "assets/derivatives" },
  "assets/real-estate": { track: "learn", section: "assets/real-estate" },
  "banking-industry": { track: "industries", section: "banking" },
  "securities-industry": { track: "industries", section: "securities" },
  "insurance-industry": { track: "industries", section: "insurance" },
  "asset-management-industry": { track: "industries", section: "asset-management" },
  "card-capital-industry": { track: "industries", section: "card-capital" },
  "crypto-industry": { track: "industries", section: "crypto" },
  actuarial: { track: "industries", section: "insurance/actuarial" },
  companies: { track: "industries", section: "companies" },
  career: { track: "career", section: "overview" },
};

// 루트 단일 파일 매핑 (docs/ 직속)
const ROOT_FILE_MAP: Record<string, Mapping & { newSlug: string }> = {
  "certifications.md": { track: "career", section: "certifications", newSlug: "certifications/index" },
  "community.mdx": { track: "career", section: "community", newSlug: "community/index" },
  "curriculum.md": { track: "learn", section: "curriculum", newSlug: "curriculum/index" },
  "finance-mbti.mdx": { track: "career", section: "mbti", newSlug: "mbti/index" },
  "intro.mdx": { track: "learn", section: "intro", newSlug: "intro/index" },
  "market-survivor.mdx": { track: "tools", section: "market-survivor", newSlug: "market-survivor/index" },
};

// ── 링크 재작성 규칙 ────────────────────────────────────────────
const LINK_RULES: Array<[RegExp, string]> = [
  [/\/docs\/foundation\//g, "/learn/foundation/"],
  [/\/docs\/financial-analysis\//g, "/learn/financial-analysis/"],
  [/\/docs\/industry-analysis\//g, "/learn/industry-analysis/"],
  [/\/docs\/company-analysis\//g, "/learn/company-analysis/"],
  [/\/docs\/valuation\//g, "/learn/valuation/"],
  [/\/docs\/macroeconomics\//g, "/learn/macro/"],
  [/\/docs\/trading-strategies\//g, "/learn/trading/"],
  [/\/docs\/risk-management\//g, "/learn/portfolio/"],
  [/\/docs\/technical\//g, "/learn/technical/"],
  [/\/docs\/quant-system\//g, "/learn/quant/"],
  [/\/docs\/masters\//g, "/research/masters/"],
  [/\/docs\/case-studies\//g, "/research/case-studies/"],
  [/\/docs\/assets\//g, "/learn/assets/"],
  [/\/docs\/companies\//g, "/industries/companies/"],
  [/\/docs\/calculators\//g, "/tools/calculators/"],
  [/\/docs\/modeling-tools\//g, "/tools/modeling/"],
  [/\/docs\/quiz\//g, "/tools/quiz/"],
  [/\/docs\/glossary\//g, "/learn/glossary/"],
  [/\/docs\/career\//g, "/career/"],
  [/\/docs\//g, "/learn/"],
];

const DOCUSAURUS_IMPORTS: Array<{ pattern: RegExp; action: string; note: string }> = [
  { pattern: /@theme\/[^"']+/g, action: "REMOVE_LINE", note: "Docusaurus 테마 import" },
  { pattern: /@site\/[^"']+/g, action: "REMAP", note: "@site/ → 상대 경로로 재작성 필요" },
  { pattern: /import\s+Link\s+from\s+["']@docusaurus\/Link["'];?/g, action: "REPLACE_WITH_NEXT_LINK", note: "Docusaurus Link → next/link" },
];

// 실제 치환 규칙 (body 전체에 적용)
const IMPORT_REWRITES: Array<[RegExp, string]> = [
  // @site/src/components/xxx → @/components/tools/xxx (계산기류)
  [/@site\/src\/components\/Calculator\/OptionGreeksCalculator/g, "@/components/tools/OptionGreeksCalculator"],
  [/@site\/src\/components\/Calculator/g, "@/components/tools/Calculator"],
  [/@site\/src\/components\/GuidedDCF\/GuidedDCF/g, "@/components/tools/GuidedDCF"],
  [/@site\/src\/components\/GuidedDCF/g, "@/components/tools/GuidedDCF"],
  [/@site\/src\/components\/CompanyComparison/g, "@/components/live/CompanyComparison"],
  [/@site\/src\/components\/MarketSurvivor/g, "@/components/tools/MarketSurvivor"],
  [/@site\/src\/components\/FinanceMBTI/g, "@/components/tools/FinanceMBTI"],
  [/@site\/src\/components\/FinanceTimeline/g, "@/components/live/FinanceTimeline"],
  [/@site\/src\/components\/Quiz/g, "@/components/tools/Quiz"],
  [/@site\/src\/components\/CandlestickChart/g, "@/components/live/CandlestickChart"],
  [/@site\/src\/components\/EconomicCalendar/g, "@/components/live/EconomicCalendar"],
  [/@site\/src\/components\/MarketDataWidget/g, "@/components/live/MarketDataWidget"],
  [/@site\/src\/components\/MarketOverviewWidget/g, "@/components/live/MarketOverviewWidget"],
  [/@site\/src\/components\/PortfolioSimulator/g, "@/components/tools/PortfolioSimulator"],
  [/@site\/src\/components\/RealTimeDataDashboard/g, "@/components/live/RealTimeDataDashboard"],
  [/@site\/src\/components\/CrossLink/g, "@/components/learn/CrossLink"],
  [/@site\/src\/components\/ProgressTracker/g, "@/components/learn/ProgressTracker"],
  [/@site\/src\/components\/ReadingProgress/g, "@/components/learn/ReadingProgress"],
  [/@site\/src\/components\/HomepageHero/g, "@/components/marketing/HomepageHero"],
  [/@site\/src\/components\/GiscusComments/g, "@/components/learn/GiscusComments"],
  [/@site\/src\/components\/Chat/g, "@/components/ai/ChatSidebar"],
  // @docusaurus/Link → next/link
  [/@docusaurus\/Link/g, "next/link"],
  // @theme/Tabs, @theme/TabItem → shadcn tabs (Phase 1.5에서 실제 매핑)
  [/from\s+["']@theme\/Tabs["']/g, 'from "@/components/ui/tabs"'],
  [/from\s+["']@theme\/TabItem["']/g, 'from "@/components/ui/tabs"'],
  // @theme/* 제거 (line 전체 제거)
  [/^\s*import\s+[^\n]*from\s+["']@theme\/[^"']+["'];?\s*$/gm, ""],
  // 상대 경로 MDX import 제거 (ENOENT 방지) — v1의 중첩 MDX 임베드는 링크로 대체
  [/^\s*import\s+\w+\s+from\s+["']\.\/[^"']+["'];?\s*$/gm, ""],
  [/^\s*import\s+\w+\s+from\s+["']\.\.\/[^"']+["'];?\s*$/gm, ""],
];

// ── front matter 파싱 (yaml 의존성 없이 최소 구현) ─────────────
type FrontMatter = Record<string, unknown>;

function parseFrontMatter(raw: string): { data: FrontMatter; body: string } {
  // CRLF + LF 모두 지원, 닫는 --- 뒤 공백/개행 허용
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n)?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const yaml = match[1] ?? "";
  const body = match[2] ?? "";
  const data: FrontMatter = {};
  for (const line of yaml.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*?)\s*$/);
    if (!m) continue;
    const [, key, val] = m;
    if (!key) continue;
    const v = (val ?? "").trim();
    if (v === "" || v === "null") data[key] = null;
    else if (v === "true") data[key] = true;
    else if (v === "false") data[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(v)) data[key] = Number(v);
    else if (v.startsWith("[") && v.endsWith("]")) {
      data[key] = v.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else data[key] = v.replace(/^["']|["']$/g, "");
  }
  return { data, body };
}

function serializeFrontMatter(data: FrontMatter): string {
  const lines = ["---"];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((x) => JSON.stringify(x)).join(", ")}]`);
    } else if (typeof v === "string") {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

// ── 디렉토리 순회 ────────────────────────────────────────────────
async function walk(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) await walk(full, acc);
    else if (/\.(md|mdx)$/i.test(e.name)) acc.push(full);
  }
  return acc;
}

function resolveMapping(relPath: string): Mapping | null {
  // e.g. "assets/bonds/duration.md" → assets/bonds
  const segments = relPath.split(/[\\/]/);
  for (let depth = 2; depth >= 1; depth--) {
    const key = segments.slice(0, depth).join("/");
    if (DIR_MAP[key]) return DIR_MAP[key] ?? null;
  }
  return null;
}

type Report = {
  total: number;
  migrated: number;
  skipped: Array<{ path: string; reason: string }>;
  specialImports: Array<{ file: string; match: string; action: string }>;
  byTrack: Record<string, number>;
};

async function main() {
  const report: Report = {
    total: 0,
    migrated: 0,
    skipped: [],
    specialImports: [],
    byTrack: {},
  };

  try {
    await stat(V1_DOCS);
  } catch {
    console.error(`❌ V1 docs not found at: ${V1_DOCS}`);
    process.exit(1);
  }

  const files = await walk(V1_DOCS);
  report.total = files.length;

  for (const file of files) {
    const rel = relative(V1_DOCS, file).replace(/\\/g, "/");
    const rootMapping = ROOT_FILE_MAP[rel];
    const dirMapping = rootMapping ? null : resolveMapping(rel);
    const mapping: (Mapping & { newSlug?: string }) | null = rootMapping ?? dirMapping;
    if (!mapping) {
      report.skipped.push({ path: rel, reason: "no-mapping" });
      continue;
    }
    if (ONLY && !ONLY.some((o) => rel.startsWith(o))) continue;

    const raw = await readFile(file, "utf8");
    const { data, body } = parseFrontMatter(raw);

    // 링크 재작성
    let nextBody = body;
    for (const [re, to] of LINK_RULES) nextBody = nextBody.replace(re, to);

    // import 재작성 (실제 치환)
    for (const [re, to] of IMPORT_REWRITES) nextBody = nextBody.replace(re, to);

    // Markdown 상대 링크 → 절대 URL 치환 (velite ENOENT 방지)
    // 현재 파일의 v2 URL 디렉토리 = /{track}/{section}/{...}
    const relWithoutExt = rel.replace(/\.(md|mdx)$/i, "");
    const currentDirUrl = rootMapping
      ? `/${mapping.track}/${rootMapping.section}`
      : `/${mapping.track}/${relWithoutExt.substring(0, relWithoutExt.lastIndexOf("/"))}`;

    nextBody = nextBody.replace(/\]\(\.\/([^)#\s]+?)(\.(?:md|mdx))?(#[^)]*)?\)/g, (_m, p, _ext, h = "") => {
      return `](${currentDirUrl}/${p}${h ?? ""})`;
    });
    nextBody = nextBody.replace(/\]\(\.\.\/([^)#\s]+?)(\.(?:md|mdx))?(#[^)]*)?\)/g, (_m, p, _ext, h = "") => {
      const parent = currentDirUrl.substring(0, currentDirUrl.lastIndexOf("/"));
      return `](${parent}/${p}${h ?? ""})`;
    });

    // 특수 import 감지 (리포트)
    for (const { pattern, action } of DOCUSAURUS_IMPORTS) {
      const matches = body.match(pattern);
      if (matches) {
        for (const m of matches) report.specialImports.push({ file: rel, match: m, action });
      }
    }

    let v2Rel: string;
    if (rootMapping) {
      v2Rel = `${rootMapping.newSlug}.mdx`;
    } else {
      v2Rel = `${mapping.section}/${rel.replace(/^[^/]+\//, "")}`.replace(/\.md$/i, ".mdx");
    }
    const outPath = join(V2_CONTENT, mapping.track, v2Rel);

    const slug = v2Rel.replace(/\.mdx$/, "");
    const newFrontMatter: FrontMatter = {
      title: data.title ?? slug,
      description: data.description ?? "",
      slug,
      track: mapping.track,
      section: mapping.section,
      order: data.sidebar_position ?? data.order ?? 999,
      difficulty: data.difficulty ?? "intermediate",
      readingMinutes: data.readingMinutes ?? 5,
      tags: data.tags ?? [],
      koreaContext: data.koreaContext ?? false,
      draft: data.draft ?? false,
    };

    report.migrated++;
    report.byTrack[mapping.track] = (report.byTrack[mapping.track] ?? 0) + 1;

    if (APPLY) {
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, serializeFrontMatter(newFrontMatter) + nextBody, "utf8");
    }
  }

  const summary = {
    mode: APPLY ? "APPLY" : "DRY-RUN",
    v1Root: V1_DOCS,
    v2Root: V2_CONTENT,
    ...report,
    skippedSample: report.skipped.slice(0, 10),
    specialImportsSample: report.specialImports.slice(0, 15),
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
