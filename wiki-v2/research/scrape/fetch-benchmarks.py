#!/usr/bin/env python3
"""
CUFA wiki v2 — 벤치마크·레퍼런스 사이트 스크래핑 (Scrapling 0.4.x)

목적: 찬희 피드백 반영.
  - 백준형 난이도/구조 벤치마크
  - Investopedia 초보자 친화 금융 용어 구조
  - Damodaran 박사급 리서치 문체
  - FRED 핵심 시계열 리스트
  - BOK ECOS 주요 지표 리스트

결과는 research/benchmarks/*.json 저장.
CLAUDE.md 보안 규정 준수: 개인 경로/토큰/IP 하드코딩 없음.

실행:
  python research/scrape/fetch-benchmarks.py
  python research/scrape/fetch-benchmarks.py --only=baekjoon,investopedia
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from typing import Any, Callable

OUT = Path(__file__).resolve().parent.parent / "benchmarks"
OUT.mkdir(parents=True, exist_ok=True)


def save(name: str, data: Any) -> None:
    path = OUT / f"{name}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  saved -> {path.relative_to(Path.cwd())}")


def first(sel_result):
    """Scrapling 0.4.x에는 css_first가 없어서 list[0]로 안전 접근."""
    if sel_result is None:
        return None
    try:
        return sel_result[0] if len(sel_result) else None
    except (TypeError, IndexError):
        return None


def attempt(fn: Callable[[], Any], label: str) -> Any | None:
    try:
        return fn()
    except Exception as e:  # noqa: BLE001 — fetch 실패는 건너뛰고 보고
        print(f"  [skip] {label}: {type(e).__name__} {str(e)[:120]}")
        return None


def get_fetcher():
    from scrapling.fetchers import Fetcher  # type: ignore
    return Fetcher


def scrape_baekjoon_step(F) -> dict:
    """백준 단계별 문제 목록 — 난이도 분류 구조 벤치마크."""
    p = F.get("https://www.acmicpc.net/step", timeout=20)
    rows = p.css("table#step_table tbody tr") or p.css("table tbody tr") or []
    steps: list[dict] = []
    for r in rows[:60]:
        cells = r.css("td")
        if len(cells) < 3:
            continue
        idx = cells[0].text.strip()
        title_el = first(cells[1].css("a")) or cells[1]
        title = (title_el.text or "").strip()
        desc = cells[2].text.strip() if len(cells) > 2 else ""
        steps.append({"step": idx, "title": title, "description": desc})
    return {
        "source": "https://www.acmicpc.net/step",
        "status": p.status,
        "stepCount": len(steps),
        "sample": steps[:15],
        "notes": "백준의 난이도 분류 = 단계별 점진 누적. CUFA는 L1→L4 + 자산별 → 진도/뱃지 매핑",
    }


def scrape_investopedia_dcf(F) -> dict:
    """Investopedia DCF 페이지 — 초보자 친화 금융 용어 페이지 구조 벤치마크."""
    p = F.get("https://www.investopedia.com/terms/d/dcf.asp", timeout=20)
    headings = [h.text.strip() for h in (p.css("h2, h3") or []) if (h.text or "").strip()]
    key_takeaways = []
    kt_el = first(p.css("#toc-key-takeaways")) or first(p.css("div.key-takeaways")) or first(p.css("ul.key-takeaways"))
    if kt_el is not None:
        key_takeaways = [li.text.strip() for li in kt_el.css("li") if (li.text or "").strip()]
    first_para = ""
    fp = first(p.css("article p")) or first(p.css("p"))
    if fp is not None:
        first_para = (fp.text or "").strip()[:400]
    return {
        "source": "https://www.investopedia.com/terms/d/dcf.asp",
        "status": p.status,
        "headings": headings[:30],
        "keyTakeawaysSample": key_takeaways[:6],
        "firstParagraph": first_para,
        "notes": "Investopedia 구조 = 한 줄 정의 + Key Takeaways(bullet) + H2 섹션(공식→예시→한계). CUFA용어사전에 반영",
    }


def scrape_damodaran(F) -> dict:
    """Aswath Damodaran 블로그 — 박사급 밸류에이션 레퍼런스 최신 포스트 제목."""
    p = F.get("http://pages.stern.nyu.edu/~adamodar/", timeout=20)
    titles: list[str] = []
    for a in (p.css("a") or [])[:200]:
        t = (a.text or "").strip()
        if 12 <= len(t) <= 160:
            titles.append(t)
    return {
        "source": "http://pages.stern.nyu.edu/~adamodar/",
        "status": p.status,
        "titleCount": len(titles),
        "sample": titles[:20],
        "notes": "Damodaran 문체 = 개념→데이터→한계→자기비판. CUFA Valuation 섹션 톤 기준",
    }


def scrape_fred_popular(F) -> dict:
    """FRED 인기 시계열 — 박사급 매크로 데이터 출처 카탈로그."""
    p = F.get("https://fred.stlouisfed.org/tags/series?t=popular", timeout=20)
    items: list[dict] = []
    for li in (p.css("div.series-pager-list li, div#pager-list li, li.search-result") or [])[:40]:
        title_el = li._first("a") or li
        title = (title_el.text or "").strip()
        href_val = ""
        if hasattr(title_el, "attrib"):
            href_val = title_el.attrib.get("href", "") if title_el.attrib else ""
        if title:
            items.append({"title": title[:180], "href": href_val})
    return {
        "source": "https://fred.stlouisfed.org/tags/series?t=popular",
        "status": p.status,
        "itemCount": len(items),
        "sample": items[:20],
        "notes": "FRED = CUFA 거시경제 섹션 1차 출처 화이트리스트",
    }


def scrape_bok_ecos(F) -> dict:
    """한국은행 ECOS — 국내 공식 거시 데이터 출처 카탈로그."""
    p = F.get("https://ecos.bok.or.kr/", timeout=20)
    headings = [h.text.strip() for h in (p.css("h1, h2, h3") or []) if (h.text or "").strip()][:15]
    main_links: list[str] = []
    for a in (p.css("nav a, ul.gnb a") or [])[:30]:
        t = (a.text or "").strip()
        if t:
            main_links.append(t)
    return {
        "source": "https://ecos.bok.or.kr/",
        "status": p.status,
        "headings": headings,
        "navSample": main_links[:20],
        "notes": "BOK ECOS = 국내 거시 1차 출처. 기준금리/환율/CPI/GDP 시리즈 ID 카탈로그화 필요",
    }


def scrape_kdi(F) -> dict:
    """KDI 경제전망 — 국책연 정책 리포트 카탈로그."""
    p = F.get("https://www.kdi.re.kr/research/reportList?pub_no=11", timeout=20)
    rows = (p.css("ul.reports > li, div.list-area li, ul.list > li") or [])[:15]
    items: list[dict] = []
    for li in rows:
        title_el = first(li.css("a, strong, h3")) or li
        title = (title_el.text or "").strip()
        if 5 < len(title) < 200:
            items.append({"title": title})
    return {
        "source": "https://www.kdi.re.kr/",
        "status": p.status,
        "itemCount": len(items),
        "sample": items[:10],
        "notes": "KDI = 한국 경제정책 연구 1차 출처 (+ KIF, 금융연구원)",
    }


TARGETS = {
    "baekjoon_step": scrape_baekjoon_step,
    "investopedia_dcf": scrape_investopedia_dcf,
    "damodaran": scrape_damodaran,
    "fred_popular": scrape_fred_popular,
    "bok_ecos": scrape_bok_ecos,
    "kdi": scrape_kdi,
}


def main() -> int:
    F = get_fetcher()
    args = [a for a in sys.argv[1:] if a.startswith("--only=")]
    only = args[0].split("=", 1)[1].split(",") if args else list(TARGETS.keys())

    manifest: dict[str, Any] = {"fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "targets": {}}

    for name in only:
        fn = TARGETS.get(name)
        if not fn:
            print(f"[?] unknown target: {name}")
            continue
        print(f"[{name}] fetching...")
        data = attempt(lambda f=fn, F=F: f(F), name)
        if data is not None:
            save(name, data)
            manifest["targets"][name] = {"ok": True, "status": data.get("status")}
        else:
            manifest["targets"][name] = {"ok": False}
        time.sleep(1.2)

    save("_manifest", manifest)
    ok = sum(1 for v in manifest["targets"].values() if v.get("ok"))
    print(f"\n=== {ok}/{len(manifest['targets'])} targets OK ===")
    return 0 if ok > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
