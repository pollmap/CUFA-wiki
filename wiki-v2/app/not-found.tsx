import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="mt-6 text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
        요청하신 경로는 존재하지 않거나 v2 리빌드 중 이동되었습니다.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold"
        style={{
          backgroundColor: "var(--color-brand-primary)",
          color: "var(--color-bg-primary)",
        }}
      >
        홈으로
      </Link>
    </div>
  );
}
