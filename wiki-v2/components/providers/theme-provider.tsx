"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ComponentProps, ReactNode } from "react";

type Props = {
  children: ReactNode;
} & Omit<ComponentProps<typeof NextThemeProvider>, "children">;

export function ThemeProvider({ children, ...props }: Props) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
