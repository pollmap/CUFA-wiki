#!/usr/bin/env python3
"""공식 기관 보도자료 다이제스트 수집 (Scrapling).

Tier 1 공식 기관 5곳에서 최근 보도자료 3건씩 스크래핑하여
`content/research/news-digest/*.mdx` 로 저장.

출처:
    1. 한국은행 보도자료 (통화정책)
    2. 금융위원회 보도자료
    3. KDI 발간물
    4. Federal Reserve Press Releases
    5. BIS Publications

실행:
    cd wiki-v2 && PYTHONIOENCODING=utf-8 python scripts/research/scrape-news-digest.py
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Callable

try:
    from scrapling import Fetcher
    from scrapling.fetchers import StealthyFetcher
except ImportError:
    print("scrapling 미설치. `pip install scrapling` 후 재실행.", file=sys.stderr)
    sys.exit(1)


# Windows cp949 방지
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


ROOT = Path(__file__).resolve().parents[2]
OUT_DATA = Path(__file__).parent
MDX_DIR = ROOT / "content" / "research" / "news-digest"
MDX_DIR.mkdir(parents=True, exist_ok=True)
TODAY = datetime.utcnow().strftime("%Y-%m-%d")
MONTH_SLUG = datetime.utcnow().strftime("%Y-%m")


@dataclass
class NewsItem:
    title: str
    date: str
    url: str
    summary: str = ""


@dataclass
class SourceResult:
    host: str
    name: str
    list_url: str
    items: list[NewsItem] = field(default_factory=list)
    error: str | None = None


# ---------------------------------------------------------------------------
# 사이트별 파서 (list page → top-3 items)
# ---------------------------------------------------------------------------


def _clean(txt: str) -> str:
    return re.sub(r"\s+", " ", (txt or "")).strip()


def _abs_url(base: str, href: str) -> str:
    if not href:
        return base
    if href.startswith("http://") or href.startswith("https://"):
        return href
    if href.startswith("//"):
        return "https:" + href
    if href.startswith("/"):
        m = re.match(r"^(https?://[^/]+)", base)
        return (m.group(1) if m else base) + href
    return base.rstrip("/") + "/" + href.lstrip("./")


def parse_bok(page, list_url: str) -> list[NewsItem]:
    """한국은행 — table.bbs_list 구조."""
    items: list[NewsItem] = []
    # 다양한 셀렉터 시도
    selectors = [
        "table.bbs_list tbody tr",
        "table tbody tr",
        "ul.bbs_list li",
        "div.board-list ul li",
    ]
    rows = []
    for sel in selectors:
        rows = page.css(sel)
        if rows:
            break

    for row in rows[:10]:
        a = row.css_first("a")
        if not a:
            continue
        title = _clean(getattr(a, "text", "") or a.attrib.get("title", ""))
        if not title or len(title) < 4:
            continue
        href = a.attrib.get("href", "")
        url = _abs_url(list_url, href)
        # 날짜 추출 시도
        date = ""
        for td in row.css("td"):
            t = _clean(getattr(td, "text", ""))
            m = re.search(r"(20\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})", t)
            if m:
                date = f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
                break
        items.append(NewsItem(title=title[:200], date=date, url=url))
        if len(items) >= 3:
            break
    return items


def parse_fsc(page, list_url: str) -> list[NewsItem]:
    """금융위원회 — 게시판."""
    items: list[NewsItem] = []
    selectors = [
        "ul.board-list li",
        "table tbody tr",
        "div.subject a",
        "a.subject",
        "ul li a.tit",
    ]
    candidates = []
    for sel in selectors:
        found = page.css(sel)
        if found:
            candidates = found
            break

    for el in candidates[:20]:
        a = el if el.tag == "a" else el.css_first("a")
        if not a:
            continue
        title = _clean(getattr(a, "text", "") or a.attrib.get("title", ""))
        if not title or len(title) < 6:
            continue
        url = _abs_url(list_url, a.attrib.get("href", ""))
        # 날짜 추출
        date = ""
        parent_text = _clean(getattr(el, "text", ""))
        m = re.search(r"(20\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})", parent_text)
        if m:
            date = f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
        items.append(NewsItem(title=title[:200], date=date, url=url))
        if len(items) >= 3:
            break
    return items


def parse_kdi(page, list_url: str) -> list[NewsItem]:
    """KDI 연구 리스트."""
    items: list[NewsItem] = []
    selectors = [
        "ul.pub_list li",
        "div.board-list ul li",
        "ul li article",
        "table tbody tr",
        "div.list-item",
        "a.subject",
    ]
    candidates = []
    for sel in selectors:
        found = page.css(sel)
        if found:
            candidates = found
            break

    for el in candidates[:20]:
        a = el if el.tag == "a" else el.css_first("a")
        if not a:
            continue
        title = _clean(getattr(a, "text", "") or a.attrib.get("title", ""))
        if not title or len(title) < 6:
            continue
        url = _abs_url(list_url, a.attrib.get("href", ""))
        date = ""
        parent_text = _clean(getattr(el, "text", ""))
        m = re.search(r"(20\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})", parent_text)
        if m:
            date = f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
        items.append(NewsItem(title=title[:200], date=date, url=url))
        if len(items) >= 3:
            break
    return items


def parse_fed(page, list_url: str) -> list[NewsItem]:
    """Federal Reserve press releases."""
    items: list[NewsItem] = []
    # Fed 사이트는 .eventlist__event 구조 사용
    selectors = [
        "div.eventlist__event",
        "div.row.ng-scope",
        "article",
        "div.col-xs-9",
        "h4 a",
    ]
    candidates = []
    for sel in selectors:
        found = page.css(sel)
        if found:
            candidates = found
            break

    for el in candidates[:20]:
        a = el if el.tag == "a" else el.css_first("a")
        if not a:
            continue
        title = _clean(getattr(a, "text", "") or a.attrib.get("title", ""))
        if not title or len(title) < 10:
            continue
        url = _abs_url(list_url, a.attrib.get("href", ""))
        date = ""
        parent_text = _clean(getattr(el, "text", ""))
        m = re.search(
            r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(20\d{2})",
            parent_text,
        )
        if m:
            months = {
                "January": 1, "February": 2, "March": 3, "April": 4,
                "May": 5, "June": 6, "July": 7, "August": 8,
                "September": 9, "October": 10, "November": 11, "December": 12,
            }
            date = f"{m.group(3)}-{months[m.group(1)]:02d}-{int(m.group(2)):02d}"
        else:
            m2 = re.search(r"(20\d{2})-(\d{2})-(\d{2})", url)
            if m2:
                date = m2.group(0)
        items.append(NewsItem(title=title[:200], date=date, url=url))
        if len(items) >= 3:
            break
    return items


def parse_bis(page, list_url: str) -> list[NewsItem]:
    """BIS publications."""
    items: list[NewsItem] = []
    selectors = [
        "table.documentList tbody tr",
        "table tbody tr",
        "div.item.list-item",
        "ul.documentList li",
        "a.title",
    ]
    candidates = []
    for sel in selectors:
        found = page.css(sel)
        if found:
            candidates = found
            break

    for el in candidates[:20]:
        a = el if el.tag == "a" else el.css_first("a")
        if not a:
            continue
        title = _clean(getattr(a, "text", "") or a.attrib.get("title", ""))
        if not title or len(title) < 10:
            continue
        url = _abs_url(list_url, a.attrib.get("href", ""))
        date = ""
        parent_text = _clean(getattr(el, "text", ""))
        m = re.search(r"(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(20\d{2})", parent_text)
        if m:
            months = {
                "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
                "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
            }
            date = f"{m.group(3)}-{months[m.group(2)]:02d}-{int(m.group(1)):02d}"
        items.append(NewsItem(title=title[:200], date=date, url=url))
        if len(items) >= 3:
            break
    return items


# ---------------------------------------------------------------------------
# Targets
# ---------------------------------------------------------------------------


TARGETS: list[dict] = [
    {
        "host": "bok",
        "name": "한국은행",
        "korean_name": "한국은행",
        "list_url": "https://www.bok.or.kr/portal/bbs/B0000046/list.do?menuNo=200761",
        "parser": parse_bok,
        "topic": "통화정책·금융안정",
        "tags": ["중앙은행", "통화정책", "한국은행"],
        "stealth": False,
    },
    {
        "host": "fsc",
        "name": "Financial Services Commission",
        "korean_name": "금융위원회",
        "list_url": "https://www.fsc.go.kr/no010101",
        "parser": parse_fsc,
        "topic": "금융정책·규제",
        "tags": ["금융규제", "금융위원회", "정책"],
        "stealth": False,
    },
    {
        "host": "kdi",
        "name": "Korea Development Institute",
        "korean_name": "KDI 한국개발연구원",
        "list_url": "https://www.kdi.re.kr/research/subjects",
        "parser": parse_kdi,
        "topic": "거시경제·정책연구",
        "tags": ["KDI", "정책연구", "거시경제"],
        "stealth": False,
    },
    {
        "host": "fed",
        "name": "Federal Reserve",
        "korean_name": "미국 연방준비제도",
        "list_url": "https://www.federalreserve.gov/newsevents/pressreleases.htm",
        "parser": parse_fed,
        "topic": "미국 통화정책",
        "tags": ["Fed", "미국 통화정책", "FOMC"],
        "stealth": True,
    },
    {
        "host": "bis",
        "name": "Bank for International Settlements",
        "korean_name": "국제결제은행 BIS",
        "list_url": "https://www.bis.org/publ/index.htm",
        "parser": parse_bis,
        "topic": "글로벌 금융 인프라·규제",
        "tags": ["BIS", "국제금융", "바젤"],
        "stealth": False,
    },
]


# ---------------------------------------------------------------------------
# MDX 생성
# ---------------------------------------------------------------------------


def escape_mdx(txt: str) -> str:
    """MDX에서 문제되는 문자 이스케이프."""
    # { } 는 JSX 로 해석되므로 백슬래시 이스케이프
    txt = txt.replace("{", "\\{").replace("}", "\\}")
    # < > 는 태그로 해석되므로 이스케이프
    txt = txt.replace("<", "&lt;").replace(">", "&gt;")
    return txt


def build_mdx(target: dict, result: SourceResult, order: int) -> str:
    host = target["host"]
    korean_name = target["korean_name"]
    tags = target["tags"]
    topic = target["topic"]
    list_url = target["list_url"]

    tags_yaml = "\n".join(f'  - "{t}"' for t in tags)
    sources_block = f'''  - label: "{korean_name} 공식 목록"
    url: "{list_url}"
    accessed: "{TODAY}"'''

    header = f"""---
title: "공식 보도자료 다이제스트 — {korean_name}"
description: "{korean_name} {topic} 최근 보도자료 {len(result.items)}건 자동 수집 요약"
slug: "news-digest/{host}-{MONTH_SLUG}"
track: "research"
section: "news-digest"
order: {order}
date: "{TODAY}"
difficulty: "intermediate"
koreaContext: {"true" if host in {"bok", "fsc", "kdi"} else "false"}
tags:
{tags_yaml}
sources:
{sources_block}
---

# {korean_name} 최근 보도자료 다이제스트

> **수집 일자**: {TODAY} · **출처**: [{korean_name} 공식]({list_url}) · **수집 방식**: Scrapling (Tier 1 공식 기관)
>
> 본 페이지는 자동 수집된 요약입니다. 정확한 본문은 반드시 원문 링크를 참고하세요.

"""

    if not result.items:
        header += "> ⚠️ 이번 수집 주기에서 항목을 파싱하지 못했습니다. 원문 목록을 직접 확인하세요.\n"
        return header

    body_parts: list[str] = []
    for idx, item in enumerate(result.items, 1):
        title_esc = escape_mdx(item.title)
        date_str = item.date if item.date else "날짜 정보 없음"
        body_parts.append(
            f"""## {idx}. {title_esc}

- **발표일**: {date_str}
- **출처**: {korean_name}
- **원문 링크**: [바로가기]({item.url})
"""
        )

    footer = f"""
---

## 활용 가이드

이 다이제스트는 **Tier 1 공식 출처**에서 자동 수집한 원문 메타데이터만 포함합니다. CUFA 리서치 원칙상 상용 뉴스·블로그·나무위키는 채택하지 않습니다.

- 본문 해석·요약은 반드시 원문을 확인한 뒤 작성하세요.
- {korean_name} 홈페이지 개편 시 셀렉터가 변경될 수 있으며, 수집 실패 항목은 상단 경고로 노출됩니다.
- 수집 스크립트: `scripts/research/scrape-news-digest.py`
"""

    return header + "\n".join(body_parts) + footer


# ---------------------------------------------------------------------------
# 메인 실행
# ---------------------------------------------------------------------------


def fetch_one(target: dict, fetcher: Fetcher, stealth_fetcher) -> SourceResult:
    result = SourceResult(
        host=target["host"], name=target["name"], list_url=target["list_url"]
    )
    try:
        print(f"→ [{target['host']}] fetching {target['list_url']}")
        if target.get("stealth") and stealth_fetcher is not None:
            page = stealth_fetcher.fetch(target["list_url"], timeout=30)
        else:
            page = fetcher.get(target["list_url"], timeout=25)
        status = getattr(page, "status", None)
        if status and status >= 400:
            raise RuntimeError(f"HTTP {status}")
        items = target["parser"](page, target["list_url"])
        result.items = items
        print(f"  ✓ {len(items)} items extracted")
    except Exception as e:
        result.error = f"{type(e).__name__}: {e}"
        print(f"  ✗ 실패: {result.error}")
    return result


def main() -> None:
    fetcher = Fetcher()
    try:
        stealth_fetcher = StealthyFetcher
    except Exception:
        stealth_fetcher = None

    raw_records: list[dict] = []

    for order, target in enumerate(TARGETS, 1):
        result = fetch_one(target, fetcher, stealth_fetcher)

        # raw json
        raw_records.append(
            {
                "host": result.host,
                "name": result.name,
                "list_url": result.list_url,
                "error": result.error,
                "items": [asdict(i) for i in result.items],
                "collected_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
            }
        )

        # 성공 시에만 MDX
        if result.items:
            mdx_text = build_mdx(target, result, order)
            mdx_path = MDX_DIR / f"{target['host']}-{MONTH_SLUG}.mdx"
            mdx_path.write_text(mdx_text, encoding="utf-8")
            print(f"  → MDX: {mdx_path.relative_to(ROOT)}")

        time.sleep(1.5)  # 예의상 rate-limit

    # 공통 raw json
    raw_path = OUT_DATA / "news-digest-raw.json"
    raw_path.write_text(
        json.dumps(raw_records, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n▲ Raw JSON: {raw_path.relative_to(ROOT)}")

    # 요약
    print("\n=== 요약 ===")
    succ = 0
    fail = 0
    total_items = 0
    for rec in raw_records:
        if rec["error"]:
            fail += 1
            print(f"  ✗ {rec['host']:<6} ERROR: {rec['error']}")
        else:
            succ += 1
            total_items += len(rec["items"])
            print(f"  ✓ {rec['host']:<6} {len(rec['items'])} items")
    print(f"\n성공: {succ}/{len(TARGETS)} 소스, 총 {total_items} 항목 수집")


if __name__ == "__main__":
    main()
