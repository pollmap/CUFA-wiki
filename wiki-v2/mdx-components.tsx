"use client";

import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { MarginNote } from "@/components/learn/margin-note";
import { DropCap } from "@/components/learn/drop-cap";
import { KoreaContext } from "@/components/learn/korea-context";
import { WhatYouWillLearn } from "@/components/learn/what-you-will-learn";
import { SourceCitation } from "@/components/learn/source-citation";
import { FootnoteRef, Footnote, Footnotes } from "@/components/learn/footnote";
import { Term } from "@/components/learn/term";
import { FormulaWithProof } from "@/components/learn/formula-with-proof";
import { Related } from "@/components/learn/related";
import { Calculator } from "@/components/tools/Calculator";
import { GuidedDCF } from "@/components/tools/GuidedDCF";
import { WACC } from "@/components/tools/WACC";
import { DDM } from "@/components/tools/DDM";
import { RIM } from "@/components/tools/RIM";
import { EVEBITDAReverse } from "@/components/tools/EVEBITDAReverse";
import { Quiz } from "@/components/tools/Quiz";
import { GrahamNumber } from "@/components/tools/GrahamNumber";
import { PiotroskiFScore } from "@/components/tools/PiotroskiFScore";
import { AltmanZ } from "@/components/tools/AltmanZ";
import { DuPont } from "@/components/tools/DuPont";
import { KellyCriterion } from "@/components/tools/KellyCriterion";
import { SharpeRatio } from "@/components/tools/SharpeRatio";
import { BondDuration } from "@/components/tools/BondDuration";
import { FinanceMBTI } from "@/components/tools/FinanceMBTI/FinanceMBTI";
import { DartDisclosure } from "@/components/live/DartDisclosure";
import { StockChart } from "@/components/live/StockChart";
import { MacroIndicator } from "@/components/live/MacroIndicator";
import { Discussion } from "@/components/discussion/Giscus";

/**
 * Velite로 컴파일된 MDX 본문이 소비할 글로벌 컴포넌트 맵.
 * 개별 MDX 파일에서 import 없이 사용 가능한 컴포넌트 목록.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...props }) => {
      if (!href) return <span>{children}</span>;
      const isInternal = href.startsWith("/");
      if (isInternal) {
        return (
          <Link href={href} {...(props as object)}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} rel="noopener noreferrer" target="_blank" {...props}>
          {children}
        </a>
      );
    },
    MarginNote,
    DropCap,
    KoreaContext,
    WhatYouWillLearn,
    SourceCitation,
    FootnoteRef,
    Footnote,
    Footnotes,
    Term,
    FormulaWithProof,
    Related,
    Calculator,
    GuidedDCF,
    WACC,
    DDM,
    RIM,
    EVEBITDAReverse,
    Quiz,
    GrahamNumber,
    PiotroskiFScore,
    AltmanZ,
    DuPont,
    KellyCriterion,
    SharpeRatio,
    BondDuration,
    FinanceMBTI,
    DartDisclosure,
    StockChart,
    MacroIndicator,
    Discussion,
    ...components,
  };
}
