"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type Time,
} from "lightweight-charts";
import { MCPQuery } from "@/components/live/MCPQuery";

/**
 * StockChart — 주가 캔들+거래량 차트.
 * lightweight-charts v5 기반 + ResizeObserver 반응형 + 다크/라이트 테마 토큰 반영.
 */
export interface StockChartProps {
  ticker: string;
  market?: "KOSPI" | "KOSDAQ";
  range?: "1M" | "3M" | "1Y" | "5Y";
}

interface KRXCandle {
  date?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

interface KRXPayload {
  series?: KRXCandle[];
}

function normalizeSeries(data: unknown): KRXCandle[] {
  try {
    const payload = data as KRXPayload | null | undefined;
    const series = payload?.series;
    if (!Array.isArray(series)) return [];
    return series;
  } catch {
    return [];
  }
}

function toCandles(series: KRXCandle[]): CandlestickData<Time>[] {
  const out: CandlestickData<Time>[] = [];
  for (const row of series) {
    if (
      !row.date ||
      row.open === undefined ||
      row.high === undefined ||
      row.low === undefined ||
      row.close === undefined
    ) {
      continue;
    }
    out.push({
      time: row.date as Time,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
    });
  }
  return out;
}

function toVolumes(series: KRXCandle[]): HistogramData<Time>[] {
  const out: HistogramData<Time>[] = [];
  for (const row of series) {
    if (!row.date || row.volume === undefined) continue;
    const up = (row.close ?? 0) >= (row.open ?? 0);
    out.push({
      time: row.date as Time,
      value: row.volume,
      color: up ? "rgba(200, 55, 45, 0.5)" : "rgba(100, 130, 200, 0.5)",
    });
  }
  return out;
}

export function StockChart({ ticker, market = "KOSPI", range = "1Y" }: StockChartProps) {
  return (
    <MCPQuery
      tool="krx_stock_price_chart"
      args={{ ticker, market, range }}
      render={(data: unknown) => <StockChartCanvas data={data} />}
    />
  );
}

function StockChartCanvas({ data }: { data: unknown }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  const series = normalizeSeries(data);
  const candles = toCandles(series);
  const volumes = toVolumes(series);
  const empty = candles.length === 0;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || empty) return;

    const bg = theme === "dark" ? "#0d1015" : "#f7f3ec";
    const text = theme === "dark" ? "#d6cfc1" : "#262017";
    const grid = theme === "dark" ? "#1c222b" : "#e6dfd1";

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: bg },
        textColor: text,
      },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      width: el.clientWidth,
      height: 360,
      rightPriceScale: { borderColor: grid },
      timeScale: { borderColor: grid, timeVisible: false },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#c8372d",
      downColor: "#4a6fa5",
      borderUpColor: "#c8372d",
      borderDownColor: "#4a6fa5",
      wickUpColor: "#c8372d",
      wickDownColor: "#4a6fa5",
    });
    candleSeries.setData(candles);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(volumes);

    chartRef.current = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        chart.applyOptions({ width: Math.floor(w) });
      }
    });
    ro.observe(el);

    chart.timeScale().fitContent();

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
    // theme + data 의존: 테마 전환 시 재생성
  }, [theme, empty, candles, volumes]);

  if (empty) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-[var(--color-ink-muted,#6b6b6b)]">
        차트 데이터 없음
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-md border border-[var(--color-paper-sunk)] bg-[var(--color-paper-soft)]"
      style={{ minHeight: 360 }}
    />
  );
}
