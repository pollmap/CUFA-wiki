"use client";

import * as runtime from "react/jsx-runtime";
import { useMDXComponents } from "@/mdx-components";

type Props = { code: string };

/**
 * Velite가 컴파일한 MDX body 실행.
 * `components` 맵은 client side에서 자체 import (RSC 직렬화 회피).
 */
export function MDXContent({ code }: Props) {
  const components = useMDXComponents({});
  try {
    const fn = new Function(code);
    const { default: Component } = fn({ ...runtime });
    return <Component components={components} />;
  } catch (error) {
    return (
      <div
        className="my-6 border border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion-soft)] px-4 py-3 text-sm"
        role="alert"
      >
        <p className="font-semibold">문서 렌더 실패</p>
        <pre className="mt-2 overflow-x-auto text-xs">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
