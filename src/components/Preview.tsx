import { useMemo, type MouseEvent } from "react";
import { renderMarkdown } from "../lib/markdown";

interface PreviewProps {
  content: string;
  onToggleTask: (index: number) => void;
}

export function Preview({ content, onToggleTask }: PreviewProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      event.preventDefault();
      const boxes = Array.from(event.currentTarget.querySelectorAll('input[type="checkbox"]'));
      onToggleTask(boxes.indexOf(target));
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <article
        className="prose-note mx-auto max-w-[68ch] px-6 py-8 sm:px-10"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: html || "<p class='prose-empty'>Nothing to preview yet.</p>" }}
      />
    </div>
  );
}
