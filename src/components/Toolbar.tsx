import { Bold, Code, Heading, Italic, Link, List, ListChecks, Quote, type LucideIcon } from "lucide-react";

export type FormatAction = "bold" | "italic" | "heading" | "list" | "task" | "quote" | "code" | "link";

const ACTIONS: { id: FormatAction; label: string; shortcut?: string; icon: LucideIcon }[] = [
  { id: "heading", label: "Heading", icon: Heading },
  { id: "bold", label: "Bold", shortcut: "Ctrl + B", icon: Bold },
  { id: "italic", label: "Italic", shortcut: "Ctrl + I", icon: Italic },
  { id: "list", label: "Bulleted list", icon: List },
  { id: "task", label: "Checklist", icon: ListChecks },
  { id: "quote", label: "Quote", icon: Quote },
  { id: "code", label: "Code", icon: Code },
  { id: "link", label: "Link", shortcut: "Ctrl + K", icon: Link },
];

interface ToolbarProps {
  onAction: (action: FormatAction) => void;
  disabled: boolean;
}

export function Toolbar({ onAction, disabled }: ToolbarProps) {
  return (
    <div role="toolbar" aria-label="Formatting" className="flex items-center gap-0.5">
      {ACTIONS.map(({ id, label, shortcut, icon: Icon }) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onAction(id)}
          aria-label={label}
          title={shortcut ? `${label} (${shortcut})` : label}
          className="icon-button size-8"
        >
          <Icon aria-hidden="true" className="size-4" />
        </button>
      ))}
    </div>
  );
}
