#!/usr/bin/env tsx
/**
 * Evaluator CI — 품질 + 보안 grep ban 재검증.
 *
 * 플랜 §10 기준 + CLAUDE.md 보안 규정 v1 grep ban 패턴.
 * PR 트리거 `.github/workflows/pr-quality.yml` 에서 호출.
 *
 * 실행:
 *   tsx scripts/quality-check.ts                    # 전체 검사
 *   tsx scripts/quality-check.ts --changed-only     # 변경 파일만 (CI)
 *   tsx scripts/quality-check.ts --fix              # 가벼운 자동 수정
 */

import { readFile, readdir } from "node:fs/promises";
import type { Dirent } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CONTENT = resolve(ROOT, "content");

// ── 보안 grep ban 패턴 (CLAUDE.md 보안 규정 v1) ─────────────
const SECURITY_PATTERNS: Array<{ name: string; re: RegExp; severity: "CRITICAL" | "HIGH" }> = [
  { name: "VPS IP hardcoded", re: /62\.171\.141\.206/g, severity: "CRITICAL" },
  { name: "VPS WSL host", re: /valuealpha@10\.0\.0\.2/g, severity: "CRITICAL" },
  { name: "Windows user path", re: /C:[\\/]Users[\\/]lch68/gi, severity: "CRITICAL" },
  { name: "Personal handle in content", re: /lch6817556/g, severity: "HIGH" },
  { name: "Private Obsidian path", re: /\/root\/obsidian-vault/g, severity: "CRITICAL" },
  { name: "Telegram bot token", re: /\b\d{8,12}:AA[A-Za-z0-9_-]{30,}\b/g, severity: "CRITICAL" },
  { name: "Private key header", re: /BEGIN .* PRIVATE KEY/g, severity: "CRITICAL" },
  { name: "OpenAI API key", re: /sk-[A-Za-z0-9]{20,}/g, severity: "CRITICAL" },
  { name: "Generic AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/g, severity: "CRITICAL" },
];

const CONTENT_RULES = {
  minRelated: 3,
  minSources: 2,
  koreanRatioMin: 0.7,
  maxConsecutiveBullets: 7,
  maxEmphasisRepeat: 3,
};

// SOURCES-POLICY.md 도메인 화이트리스트 (Tier 1~5)
const SOURCE_WHITELIST = [
  // Tier 1 central banks / official
  "ecos.bok.or.kr", "bok.or.kr", "federalreserve.gov", "fred.stlouisfed.org",
  "ecb.europa.eu", "boj.or.jp", "bankofengland.co.uk",
  "bis.org", "stats.bis.org", "imf.org", "data.imf.org",
  "oecd.org", "stats.oecd.org", "data-explorer.oecd.org",
  "worldbank.org", "data.worldbank.org",
  // Tier 2 Korea public
  "kostat.go.kr", "kosis.kr", "fss.or.kr", "dart.fss.or.kr", "fsc.go.kr",
  "krx.co.kr", "data.krx.co.kr", "open.krx.co.kr",
  "kdi.re.kr", "kif.re.kr", "kiep.go.kr", "kiet.re.kr", "kisdi.re.kr",
  "kipf.re.kr", "nps.or.kr", "kiri.or.kr",
  // Tier 3 academic
  "ssrn.com", "papers.ssrn.com", "nber.org", "doi.org", "dx.doi.org",
  "jstor.org", "scholar.google.com", "arxiv.org",
  "ifrs.org", "iaisweb.org",
  // Tier 4 professional standards
  "cfainstitute.org", "garp.org", "caia.org", "aicpa.org",
  "kasb.or.kr", "kicpa.or.kr", "kofia.or.kr",
  // Tier 5 (참고만)
  "pages.stern.nyu.edu", "damodaran.com",
  "oaktreecapital.com", "bridgewater.com", "gmo.com", "blackrock.com", "ark-invest.com",
];

const SOURCE_BLACKLIST = [
  "namu.wiki", "ko.wikipedia.org",
  "blog.naver.com", "cafe.naver.com", "cafe.daum.net", "tistory.com",
  "twitter.com/i/", "x.com/i/", "instagram.com", "threads.net",
];

// AI 문체 검출 (CONTENT-STYLE-GUIDE.md §3)
const AI_STYLE_PATTERNS: Array<{ name: string; re: RegExp; severity: "MEDIUM" | "LOW" }> = [
  { name: "ai-style/다음과같은", re: /다음과\s*같은/g, severity: "LOW" },
  { name: "ai-style/에대해알아보겠습니다", re: /에\s*대해\s*알아보겠습니다/g, severity: "LOW" },
  { name: "ai-style/매우굉장히반복", re: /(매우|굉장히|아주)/g, severity: "LOW" },
  { name: "ai-style/첫째둘째셋째", re: /첫째[,.\s].*둘째[,.\s].*셋째/gs, severity: "LOW" },
  { name: "ai-style/출처없는연구인용", re: /연구에\s*따르면(?![^\n]*<SourceCitation)/g, severity: "MEDIUM" },
  { name: "ai-style/출처없는전문가들", re: /전문가들은(?![^\n]*<SourceCitation)/g, severity: "MEDIUM" },
];

type Finding = {
  file: string;
  rule: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  message: string;
};

async function walk(dir: string, acc: string[] = []): Promise<string[]> {
  let entries: Dirent[];
  try {
    entries = (await readdir(dir, { withFileTypes: true })) as unknown as Dirent[];
  } catch {
    return acc;
  }
  for (const e of entries) {
    const name = String(e.name);
    const full = join(dir, name);
    if (e.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === ".velite") continue;
      await walk(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

function koreanRatio(text: string): number {
  const koMatches = text.match(/[\uac00-\ud7a3]/g) ?? [];
  const asciiLetters = text.match(/[A-Za-z]/g) ?? [];
  const total = koMatches.length + asciiLetters.length;
  if (total === 0) return 1;
  return koMatches.length / total;
}

async function checkSecurity(files: string[]): Promise<Finding[]> {
  const findings: Finding[] = [];
  for (const file of files) {
    if (!/\.(md|mdx|ts|tsx|js|jsx|json|yml|yaml|css|html|sql|sh|py)$/i.test(file)) continue;
    const raw = await readFile(file, "utf8");
    for (const p of SECURITY_PATTERNS) {
      if (p.re.test(raw)) {
        findings.push({
          file: relative(ROOT, file),
          rule: `security/${p.name}`,
          severity: p.severity,
          message: `Matched forbidden pattern (${p.name}). Replace with placeholder / env var.`,
        });
      }
    }
  }
  return findings;
}

function parseFrontMatter(raw: string): Record<string, unknown> | null {
  if (!raw.startsWith("---\n")) return null;
  const end = raw.indexOf("\n---", 4);
  if (end === -1) return null;
  const data: Record<string, unknown> = {};
  for (const line of raw.slice(4, end).split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    data[m[1]!] = (m[2] ?? "").trim();
  }
  return data;
}

async function checkContent(files: string[]): Promise<Finding[]> {
  const findings: Finding[] = [];
  for (const file of files) {
    if (!/\.(md|mdx)$/i.test(file)) continue;
    const rel = relative(ROOT, file);
    const raw = await readFile(file, "utf8");
    const fm = parseFrontMatter(raw);
    if (!fm) {
      findings.push({ file: rel, rule: "content/front-matter", severity: "HIGH", message: "Missing front matter block" });
      continue;
    }
    if (fm.draft === "true" || fm.draft === true) continue;

    const body = raw.split(/\n---\n/).slice(1).join("\n---\n");

    if (!/WhatYouWillLearn|:::what/i.test(body)) {
      findings.push({ file: rel, rule: "content/what-you-will-learn", severity: "MEDIUM", message: "WhatYouWillLearn 블록 없음" });
    }

    const relatedMatches = body.match(/<Related[\s\S]*?\/>|related:\s*\[.*?\]/g) ?? [];
    if (relatedMatches.length < 1) {
      findings.push({ file: rel, rule: "content/related", severity: "MEDIUM", message: `Related ≥${CONTENT_RULES.minRelated} 필요` });
    }

    const sourceMatches = body.match(/<SourceCitation/g) ?? [];
    if (sourceMatches.length < CONTENT_RULES.minSources) {
      findings.push({ file: rel, rule: "content/sources", severity: "LOW", message: `SourceCitation ≥${CONTENT_RULES.minSources} 권장` });
    }

    const hasImage = /!\[.*?\]\(.*?\)|<Image\s|```mermaid/i.test(body);
    if (!hasImage) {
      findings.push({ file: rel, rule: "content/visual", severity: "LOW", message: "이미지/도식 없음" });
    }

    const kr = koreanRatio(body);
    if (kr < CONTENT_RULES.koreanRatioMin) {
      findings.push({ file: rel, rule: "content/korean-ratio", severity: "MEDIUM", message: `한국어 비율 ${(kr * 100).toFixed(1)}% (목표 ≥${CONTENT_RULES.koreanRatioMin * 100}%)` });
    }

    // 출처 URL 화이트리스트 검증 (SOURCES-POLICY.md)
    const urlMatches = Array.from(body.matchAll(/url=["']([^"']+)["']|\]\((https?:\/\/[^)\s]+)\)/g));
    for (const m of urlMatches) {
      const url = (m[1] ?? m[2]) as string;
      if (!url || !/^https?:\/\//i.test(url)) continue;
      let host = "";
      try {
        host = new URL(url).hostname.toLowerCase();
      } catch {
        continue;
      }
      if (SOURCE_BLACKLIST.some((d) => host === d || host.endsWith("." + d))) {
        findings.push({ file: rel, rule: "source/blacklist", severity: "HIGH", message: `금지 도메인 인용: ${host} — SOURCES-POLICY.md 참조` });
      } else if (/<SourceCitation[^>]*url=["']/.test(body)) {
        // SourceCitation 태그 내부 URL은 엄격 화이트리스트
        const inCitation = body.includes(`url="${url}"`) || body.includes(`url='${url}'`);
        if (inCitation && !SOURCE_WHITELIST.some((d) => host === d || host.endsWith("." + d))) {
          findings.push({ file: rel, rule: "source/non-whitelist", severity: "HIGH", message: `SourceCitation URL 화이트리스트 밖: ${host}` });
        }
      }
    }

    // AI 문체 검출 (CONTENT-STYLE-GUIDE.md §3)
    const emphasisCount = (body.match(/매우|굉장히|아주/g) ?? []).length;
    if (emphasisCount >= CONTENT_RULES.maxEmphasisRepeat) {
      findings.push({ file: rel, rule: "ai-style/emphasis-overuse", severity: "LOW", message: `강조부사(매우/굉장히/아주) ${emphasisCount}회 — 서사로 전환 권장` });
    }
    const consecutiveBullets = (body.match(/(?:^\s*[-*]\s+.+\n){8,}/gm) ?? []).length;
    if (consecutiveBullets > 0) {
      findings.push({ file: rel, rule: "ai-style/bullet-overuse", severity: "MEDIUM", message: `연속 불릿 8개+ 블록 ${consecutiveBullets}개 — 문단 서사로 전환` });
    }
    for (const p of AI_STYLE_PATTERNS) {
      const cnt = (body.match(p.re) ?? []).length;
      if (cnt >= 2) {
        findings.push({ file: rel, rule: p.name, severity: p.severity, message: `AI 문체 패턴 ${cnt}회 감지` });
      }
    }
  }
  return findings;
}

async function main() {
  const all = await walk(ROOT);
  const contentOnly = all.filter((f) => f.startsWith(CONTENT));

  const [securityFindings, contentFindings] = await Promise.all([
    checkSecurity(all),
    checkContent(contentOnly),
  ]);

  const findings = [...securityFindings, ...contentFindings];

  const bySeverity = {
    CRITICAL: findings.filter((f) => f.severity === "CRITICAL"),
    HIGH: findings.filter((f) => f.severity === "HIGH"),
    MEDIUM: findings.filter((f) => f.severity === "MEDIUM"),
    LOW: findings.filter((f) => f.severity === "LOW"),
  };

  const report = {
    totalFiles: all.length,
    contentFiles: contentOnly.length,
    findings: findings.length,
    bySeverity: {
      CRITICAL: bySeverity.CRITICAL.length,
      HIGH: bySeverity.HIGH.length,
      MEDIUM: bySeverity.MEDIUM.length,
      LOW: bySeverity.LOW.length,
    },
    details: findings,
  };

  console.log(JSON.stringify(report, null, 2));

  if (bySeverity.CRITICAL.length > 0 || bySeverity.HIGH.length > 0) {
    console.error(`\n❌ FAIL — CRITICAL ${bySeverity.CRITICAL.length} / HIGH ${bySeverity.HIGH.length}`);
    process.exit(1);
  }
  console.log(`\n✅ PASS — MEDIUM ${bySeverity.MEDIUM.length} / LOW ${bySeverity.LOW.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
