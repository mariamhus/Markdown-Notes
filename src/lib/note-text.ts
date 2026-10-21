const TAG_PATTERN = /(?:^|\s)#([A-Za-z][\w-]{0,30})/g;

function stripCode(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]*`/g, " ");
}

function plain(line: string): string {
  return line
    .replace(/^\s{0,3}(#{1,6}\s+|>\s?|[-*+]\s+(\[[ xX]\]\s+)?|\d+[.)]\s+)/, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`]/g, "")
    .trim();
}

function lines(markdown: string): string[] {
  return markdown
    .split("\n")
    .map(plain)
    .filter((line) => line.length > 0 && !/^[-=*_]{3,}$/.test(line));
}

export function noteTitle(markdown: string): string {
  const first = lines(markdown)[0];
  if (!first) return "Untitled note";
  const withoutTags = first.replace(TAG_PATTERN, " ").replace(/\s+/g, " ").trim();
  return (withoutTags || first).slice(0, 80);
}

export function noteExcerpt(markdown: string): string {
  return lines(stripCode(markdown)).slice(1).join(" ").replace(TAG_PATTERN, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

export function noteTags(markdown: string): string[] {
  const tags = new Set<string>();
  for (const match of stripCode(markdown).matchAll(TAG_PATTERN)) tags.add(match[1].toLowerCase());
  return [...tags];
}

export function wordCount(markdown: string): number {
  const words = stripCode(markdown).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return words ? words.length : 0;
}

export function toggleTask(markdown: string, index: number): string {
  let current = -1;
  return markdown.replace(/^(\s*(?:[-*+]|\d+[.)])\s+\[)([ xX])(\])/gm, (match, start: string, mark: string, end: string) => {
    current += 1;
    if (current !== index) return match;
    return `${start}${mark === " " ? "x" : " "}${end}`;
  });
}

export function fileName(markdown: string): string {
  const slug = noteTitle(markdown)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `${slug || "note"}.md`;
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
