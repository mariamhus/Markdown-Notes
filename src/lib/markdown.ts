import DOMPurify from "dompurify";
import { marked } from "marked";

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
  if (node.tagName === "INPUT" && node.getAttribute("type") === "checkbox") {
    node.removeAttribute("disabled");
    node.setAttribute("aria-label", "Mark task as done");
  }
});

export function renderMarkdown(markdown: string): string {
  const html = marked.parse(markdown, { gfm: true, breaks: true, async: false }) as string;
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
}
