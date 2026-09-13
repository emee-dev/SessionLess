import { Markdown as ReactMarkdown } from "@tanstack/markdown/react";

export type MarkdownProps = {
  content: string;
  className?: string;
}

export function Markdown({
  content,
  className,
}: MarkdownProps) {
  return (
    <div className={`h-full ${className ?? ""}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
