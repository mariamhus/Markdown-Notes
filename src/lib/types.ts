export interface Note {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = "write" | "split" | "preview";
