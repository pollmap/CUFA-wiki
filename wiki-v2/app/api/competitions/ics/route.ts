/**
 * /api/competitions/ics — 금융권 공모전 ICS (iCalendar) export
 *
 * Google Calendar / Apple Calendar / Outlook 등에서 가져올 수 있는
 * .ics 파일을 동적으로 반환. 외부 ical 패키지 없이 RFC 5545 최소
 * 필드로 직접 조립한다.
 *
 * 데이터 원천: `content/career/overview/competitions.mdx` 표를 기반으로
 * 하드코딩한 2026 상반기 subset. 원천 확장은 Phase 7에서 MDX 파서로
 * 자동 동기화.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Competition {
  readonly title: string;
  readonly organizer: string;
  /** YYYY-MM-DD */
  readonly start: string;
  /** YYYY-MM-DD (optional — end date). */
  readonly end?: string;
  readonly url?: string;
  readonly description: string;
}

const COMPETITIONS_2026: readonly Competition[] = [
  {
    title: "한국은행 통화정책경시대회 2026",
    organizer: "한국은행",
    start: "2026-05-01",
    end: "2026-08-31",
    url: "https://www.bok.or.kr",
    description:
      "금상 1,000만원. 향후 5년간 한국은행 채용 시 서류전형 우대. 보고서+PT+질의응답. 출처: 한국은행 공식 홈페이지 (bok.or.kr).",
  },
  {
    title: "한국은행 경제 논문 공모전 2026",
    organizer: "한국은행",
    start: "2026-09-01",
    end: "2026-11-30",
    url: "https://www.bok.or.kr",
    description:
      "학술 논문 공모. 연구 역량 어필 + 한은 수시 채용 시 정성 평가. 출처: 한국은행 공식 홈페이지.",
  },
  {
    title: "금융감독원 대학생 금융콘테스트 2026",
    organizer: "금융감독원",
    start: "2026-06-01",
    end: "2026-09-30",
    url: "https://www.fss.or.kr",
    description:
      "금융교육·금융제도 아이디어 공모. 금감원·금융위 지원자 대상 정성 가점. 출처: 금융감독원 공식 홈페이지.",
  },
  {
    title: "CFA Research Challenge Korea 2026",
    organizer: "CFA Society Korea",
    start: "2026-07-01",
    end: "2026-08-31",
    url: "https://www.cfakorea.org",
    description:
      "기업분석 리포트(영어)+PT, 팀 3~5명. 리서치·IB·운용 직무 최고 수준 어필. Korea Final 우승팀은 아시아태평양 지역 대회 진출.",
  },
  {
    title: "KB 대학생 경제금융 공모전 2026",
    organizer: "KB금융",
    start: "2026-09-01",
    end: "2026-11-30",
    url: "https://www.kbfg.com",
    description:
      "논문·아이디어 부문. KB 입사 지원 시 면접 소재·관심도 어필 가능.",
  },
  {
    title: "DB손해보험 IFC 공모전 2026",
    organizer: "DB손해보험",
    start: "2026-03-01",
    end: "2026-06-30",
    url: "https://www.idbins.com",
    description:
      "기획안·데이터분석. 보험/금융 전반 다룸. 보험사·보험연구원 지원자 차별화 포인트.",
  },
  {
    title: "미래에셋 디지털 금융 페스티벌 2026",
    organizer: "미래에셋증권",
    start: "2026-04-01",
    end: "2026-06-30",
    url: "https://securities.miraeasset.com",
    description:
      "빅데이터·AI·스탁 분석·아이디어. 리서치·IT 직무 어필.",
  },
  {
    title: "예금보험공사 논문공모전 2026",
    organizer: "예금보험공사",
    start: "2026-09-01",
    end: "2026-11-30",
    url: "https://www.kdic.or.kr",
    description: "예금보험 관련 학술 논문. 규제기관 지원자 정성 평가.",
  },
  {
    title: "금융투자협회 투자 리포트 공모전 2026",
    organizer: "금융투자협회",
    start: "2026-09-01",
    end: "2026-11-30",
    url: "https://www.kofia.or.kr",
    description: "주식·채권·파생 투자 리포트. 리서치 직무 실무 역량 어필.",
  },
  {
    title: "NH투자증권 리서치 공모전 2026",
    organizer: "NH투자증권",
    start: "2026-05-01",
    end: "2026-07-31",
    url: "https://www.nhqv.com",
    description: "산업·기업 분석 리포트. 증권 리서치 정량+정성 역량 검증.",
  },
];

function toIcsDate(d: string): string {
  // YYYY-MM-DD → YYYYMMDDT090000Z (UTC, 09:00 default for all-day-ish events)
  return d.replace(/-/g, "") + "T090000Z";
}

function escapeIcs(s: string): string {
  // RFC 5545 §3.3.11 text escape: backslash, comma, semicolon, newline
  return s
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

function foldLine(line: string): string {
  // RFC 5545 §3.1: lines SHOULD be folded at 75 octets. Break on 73
  // characters to stay safely under the byte limit for Korean content.
  if (line.length <= 73) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length > 72) {
    chunks.push(" " + rest.slice(0, 72));
    rest = rest.slice(72);
  }
  if (rest.length > 0) chunks.push(" " + rest);
  return chunks.join("\r\n");
}

function buildIcs(events: readonly Competition[]): string {
  const stamp = toIcsDate(new Date().toISOString().slice(0, 10));
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CUFA wiki//competitions//KR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:CUFA 금융권 공모전 2026",
    "X-WR-TIMEZONE:Asia/Seoul",
  ];

  for (const e of events) {
    const uid = `${e.title
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9가-힣\-]/g, "")
      .toLowerCase()}@cufa.wiki`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${toIcsDate(e.start)}`);
    if (e.end) lines.push(`DTEND:${toIcsDate(e.end)}`);
    lines.push(foldLine(`SUMMARY:${escapeIcs(e.title)}`));
    lines.push(
      foldLine(
        `ORGANIZER;CN=${escapeIcs(e.organizer)}:mailto:no-reply@cufa.wiki`,
      ),
    );
    lines.push(foldLine(`DESCRIPTION:${escapeIcs(e.description)}`));
    if (e.url) lines.push(foldLine(`URL:${e.url}`));
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

export async function GET(): Promise<NextResponse> {
  const ics = buildIcs(COMPETITIONS_2026);
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="cufa-competitions-2026.ics"',
      "Cache-Control": "public, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
