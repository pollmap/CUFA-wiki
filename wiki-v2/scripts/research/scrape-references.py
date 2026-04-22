#!/usr/bin/env python3
"""
CUFA Journal — 레퍼런스 사이트 구조 스크래핑 (Scrapling).

목적: UX·IA·문체 벤치마크 후보 사이트들에서 DOM 패턴·타이포·그리드·색상을
추출하여 `research/references.json` 에 기록. 디자인 의사결정을 뒷받침한다.

실행:
    pip install scrapling
    python scripts/research/scrape-references.py

결과: scripts/research/references.<host>.json 여러 개 + references.summary.json
주의: 1초 지연 + User-Agent 기본값 사용. robots.txt 자동 준수.
"""

from __future__ import annotations

import json
import time
import re
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse

try:
    from scrapling import Fetcher
except ImportError:  # pragma: no cover
    import sys
    print("scrapling 미설치. `pip install scrapling` 후 재실행.", file=sys.stderr)
    sys.exit(1)


OUT_DIR = Path(__file__).parent
OUT_DIR.mkdir(parents=True, exist_ok=True)


TARGETS: list[dict[str, str]] = [
    # --- 학술·데이터 (문체·출처 표준) ---
    {
        "host": "fred",
        "name": "FRED — St. Louis Fed",
        "url": "https://fred.stlouisfed.org/series/FEDFUNDS",
        "purpose": "시계열 데이터 표시 / 출처·메타데이터 조판",
    },
    {
        "host": "bok-ecos",
        "name": "한국은행 경제통계시스템 ECOS",
        "url": "https://ecos.bok.or.kr/",
        "purpose": "공식 한국어 통계 UI / 테이블·라벨",
    },
    {
        "host": "nber",
        "name": "NBER Working Papers",
        "url": "https://www.nber.org/papers",
        "purpose": "학술 워킹페이퍼 리스트 / 인용 조판",
    },
    {
        "host": "damodaran",
        "name": "Aswath Damodaran — NYU Stern",
        "url": "https://pages.stern.nyu.edu/~adamodar/",
        "purpose": "학술 심층 문체 / 링크·네비게이션",
    },
    # --- 기능·UX (백준형 실용) ---
    {
        "host": "baekjoon",
        "name": "백준 온라인 저지",
        "url": "https://www.acmicpc.net/",
        "purpose": "난이도 뱃지 + 진도 트래킹 + 기능 우선",
    },
    {
        "host": "stripe-docs",
        "name": "Stripe Docs",
        "url": "https://docs.stripe.com/",
        "purpose": "3단 레이아웃 + 검색 + 타이포 정결성",
    },
    # --- 초보자 교육 (구조만 참고, 표절 X) ---
    {
        "host": "investopedia",
        "name": "Investopedia",
        "url": "https://www.investopedia.com/terms/d/dcf.asp",
        "purpose": "용어 정의 포맷 / 연관 문서 네트워크",
    },
    # --- 한국어 금융 레퍼런스 ---
    {
        "host": "kif",
        "name": "한국금융연구원",
        "url": "https://www.kif.re.kr/",
        "purpose": "한국어 연구보고서 목록 조판",
    },
    {
        "host": "krx-edu",
        "name": "한국거래소 KRX",
        "url": "https://academy.krx.co.kr/",
        "purpose": "공공 금융 교육 / 한국어 조판 관례",
    },
]


def classify_palette(html: str) -> dict[str, int]:
    """색상 빈도 추출 (hex 6자리 기준)."""
    hexes = re.findall(r"#[0-9a-fA-F]{6}\b", html)
    freq: dict[str, int] = {}
    for h in hexes:
        h = h.lower()
        freq[h] = freq.get(h, 0) + 1
    return dict(sorted(freq.items(), key=lambda kv: -kv[1])[:15])


def classify_fonts(html: str) -> list[str]:
    """font-family 선언에서 상위 서체 추출."""
    families = re.findall(
        r"font-family\s*:\s*([^;\"'}]+)", html, flags=re.IGNORECASE
    )
    seen: list[str] = []
    for fam in families:
        first = fam.split(",")[0].strip().strip('"\'')
        if first and first.lower() not in {f.lower() for f in seen}:
            seen.append(first)
        if len(seen) >= 10:
            break
    return seen


def snapshot(target: dict[str, str], fetcher: Fetcher) -> dict:
    host = urlparse(target["url"]).hostname or target["host"]
    page = fetcher.get(target["url"], timeout=20)

    html = getattr(page, "html_content", "") or str(page)
    headings = [
        h.text.strip()[:140]
        for h in page.css("h1, h2, h3")[:15]
        if getattr(h, "text", None)
    ]
    nav_labels = [
        a.text.strip()[:60]
        for a in page.css("nav a, header a")[:25]
        if getattr(a, "text", None) and a.text.strip()
    ]

    snap = {
        "host": target["host"],
        "name": target["name"],
        "url": target["url"],
        "purpose": target["purpose"],
        "status": getattr(page, "status", "n/a"),
        "title": (page.css_first("title").text if page.css_first("title") else "")[:200],
        "meta_description": "",
        "headings": headings,
        "nav_labels": nav_labels[:20],
        "palette_top": classify_palette(html),
        "font_families": classify_fonts(html),
        "collected_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
    }
    md = page.css_first('meta[name="description"]')
    if md is not None:
        snap["meta_description"] = (md.attrib.get("content", "") or "")[:400]
    return snap


def main() -> None:
    fetcher = Fetcher()
    summary: list[dict] = []

    for target in TARGETS:
        try:
            snap = snapshot(target, fetcher)
        except Exception as e:  # pragma: no cover
            snap = {
                "host": target["host"],
                "name": target["name"],
                "url": target["url"],
                "error": f"{type(e).__name__}: {e}",
            }
        out = OUT_DIR / f"references.{target['host']}.json"
        out.write_text(json.dumps(snap, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"✓ {target['host']:<14} → {out.name}")
        summary.append(
            {
                "host": snap["host"],
                "name": snap.get("name"),
                "url": snap.get("url"),
                "headings_n": len(snap.get("headings", [])),
                "nav_labels_n": len(snap.get("nav_labels", [])),
                "top_fonts": snap.get("font_families", [])[:3],
                "top_palette": list(snap.get("palette_top", {}).keys())[:5],
                "error": snap.get("error"),
            }
        )
        time.sleep(1.0)  # 예의상 rate-limit

    (OUT_DIR / "references.summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n▲ Summary → {OUT_DIR / 'references.summary.json'}")


if __name__ == "__main__":
    main()
