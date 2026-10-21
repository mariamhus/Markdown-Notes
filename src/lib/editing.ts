export interface EditResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

interface Selection {
  value: string;
  start: number;
  end: number;
}

export function wrap({ value, start, end }: Selection, marker: string, placeholder: string): EditResult {
  const selected = value.slice(start, end) || placeholder;
  const before = value.slice(0, start);
  const after = value.slice(end);
  if (before.endsWith(marker) && after.startsWith(marker)) {
    return {
      value: before.slice(0, -marker.length) + selected + after.slice(marker.length),
      selectionStart: start - marker.length,
      selectionEnd: start - marker.length + selected.length,
    };
  }
  return {
    value: before + marker + selected + marker + after,
    selectionStart: start + marker.length,
    selectionEnd: start + marker.length + selected.length,
  };
}

export function prefixLines({ value, start, end }: Selection, prefix: string): EditResult {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEndIndex = value.indexOf("\n", end);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const block = value.slice(lineStart, lineEnd);
  const blockLines = block.split("\n");
  const allPrefixed = blockLines.every((line) => line.startsWith(prefix));
  const changed = blockLines.map((line) => (allPrefixed ? line.slice(prefix.length) : prefix + line)).join("\n");
  const delta = changed.length - block.length;
  const firstDelta = allPrefixed ? -prefix.length : prefix.length;
  return {
    value: value.slice(0, lineStart) + changed + value.slice(lineEnd),
    selectionStart: Math.max(lineStart, start + firstDelta),
    selectionEnd: end + delta,
  };
}

export function insertLink({ value, start, end }: Selection): EditResult {
  const text = value.slice(start, end) || "link text";
  const insert = `[${text}](https://)`;
  const urlStart = start + text.length + 3;
  return {
    value: value.slice(0, start) + insert + value.slice(end),
    selectionStart: urlStart,
    selectionEnd: urlStart + 8,
  };
}

export function continueList({ value, start, end }: Selection): EditResult | null {
  if (start !== end) return null;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const line = value.slice(lineStart, start);
  const match = line.match(/^(\s*)([-*+]|(\d+)([.)]))\s+(\[[ xX]\]\s+)?/);
  if (!match) return null;
  const [marker, indent, bullet, number, delimiter, task] = match;
  if (line.trim() === marker.trim()) {
    const cleared = value.slice(0, lineStart) + "\n" + value.slice(start);
    return { value: cleared, selectionStart: lineStart + 1, selectionEnd: lineStart + 1 };
  }
  const nextBullet = number ? `${Number(number) + 1}${delimiter}` : bullet;
  const insert = `\n${indent}${nextBullet} ${task ? "[ ] " : ""}`;
  return {
    value: value.slice(0, start) + insert + value.slice(end),
    selectionStart: start + insert.length,
    selectionEnd: start + insert.length,
  };
}
