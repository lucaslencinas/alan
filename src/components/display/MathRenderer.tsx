"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  latex: string;
  plainText: string;
  displayMode?: boolean;
  className?: string;
}

export default function MathRenderer({
  latex,
  plainText,
  displayMode = false,
  className,
}: MathRendererProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: true,
        output: "htmlAndMathml",
      });
    } catch {
      return null;
    }
  }, [latex, displayMode]);

  if (html) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <span className={className}>{plainText}</span>;
}
