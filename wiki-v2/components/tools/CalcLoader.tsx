"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { CalcMeta } from "@/lib/calculator-registry";

/**
 * Client-side wrapper that dynamically loads the correct calculator component
 * by name. Living inside a Client Component lets us use `ssr: false` with
 * `next/dynamic`, which is disallowed from Server Components in Next 15.
 */

type ComponentName = CalcMeta["component"];

const LOADERS: Record<ComponentName, () => Promise<{
  default: React.ComponentType;
}>> = {
  GuidedDCF: () =>
    import("@/components/tools/GuidedDCF").then((m) => ({
      default: m.GuidedDCF,
    })),
  WACC: () =>
    import("@/components/tools/WACC").then((m) => ({ default: m.WACC })),
  DDM: () =>
    import("@/components/tools/DDM").then((m) => ({ default: m.DDM })),
  RIM: () =>
    import("@/components/tools/RIM").then((m) => ({ default: m.RIM })),
  EVEBITDAReverse: () =>
    import("@/components/tools/EVEBITDAReverse").then((m) => ({
      default: m.EVEBITDAReverse,
    })),
  GrahamNumber: () =>
    import("@/components/tools/GrahamNumber").then((m) => ({
      default: m.GrahamNumber,
    })),
  PiotroskiFScore: () =>
    import("@/components/tools/PiotroskiFScore").then((m) => ({
      default: m.PiotroskiFScore,
    })),
  AltmanZ: () =>
    import("@/components/tools/AltmanZ").then((m) => ({ default: m.AltmanZ })),
  DuPont: () =>
    import("@/components/tools/DuPont").then((m) => ({ default: m.DuPont })),
  KellyCriterion: () =>
    import("@/components/tools/KellyCriterion").then((m) => ({
      default: m.KellyCriterion,
    })),
  SharpeRatio: () =>
    import("@/components/tools/SharpeRatio").then((m) => ({
      default: m.SharpeRatio,
    })),
  BondDuration: () =>
    import("@/components/tools/BondDuration").then((m) => ({
      default: m.BondDuration,
    })),
};

export function CalcLoader({ component }: { component: ComponentName }) {
  const Component = useMemo(() => {
    const loader = LOADERS[component];
    if (!loader) {
      return () => (
        <div
          role="alert"
          className="rounded-md border p-4 text-sm text-[color:var(--color-vermilion)]"
        >
          알 수 없는 계산기: {component}
        </div>
      );
    }
    return dynamic(loader, {
      ssr: false,
      loading: () => (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border p-4 text-sm text-[color:var(--color-ink-muted)]"
        >
          계산기 로딩…
        </div>
      ),
    });
  }, [component]);
  return <Component />;
}
