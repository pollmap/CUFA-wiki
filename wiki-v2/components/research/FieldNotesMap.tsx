"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface FieldNote {
  slug: string;
  title: string;
  lat?: number;
  lon?: number;
  place: string;
  date: string;
  sector: string;
}

export interface FieldNotesMapProps {
  notes: FieldNote[];
}

export function FieldNotesMap({ notes }: FieldNotesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TOKEN || !containerRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [127.8, 36.5],
      zoom: 6,
    });
    const markers: mapboxgl.Marker[] = [];
    notes.forEach((n) => {
      if (n.lat == null || n.lon == null) return;
      const el = document.createElement("div");
      el.className = "fieldnote-marker";
      el.style.cssText =
        "width:14px;height:14px;border-radius:50%;background:#c8372d;border:2px solid white;cursor:pointer";
      const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
        `<div style="font-size:12px;"><strong>${n.title}</strong><br/>${n.place} · ${n.date}<br/><a href="/research/${n.slug}" style="color:#c8372d">보기 →</a></div>`,
      );
      const marker = new mapboxgl.Marker(el)
        .setLngLat([n.lon, n.lat])
        .setPopup(popup)
        .addTo(map);
      markers.push(marker);
    });
    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
    };
  }, [notes]);

  if (!TOKEN) {
    return (
      <div className="rounded border border-dashed border-[color:var(--color-ink-muted)] p-8 text-center text-sm text-[color:var(--color-ink-muted)]">
        Mapbox 토큰 미설정. <code>.env.local</code>에{" "}
        <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> 추가 후 다시 로드하세요.
        <br />
        현재 등록된 현장 노트 {notes.length}건은 하단 리스트로 볼 수 있습니다.
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      className="h-[500px] w-full rounded border border-[color:var(--color-ink-muted)]"
    />
  );
}

export default FieldNotesMap;
