import type { Note } from "./types";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

const WELCOME = `# Welcome to Notes

Notes is a small markdown editor. Write on the left, and the formatted preview updates on the right as you type. #guide

## The basics

- **Bold**, _italic_, and \`inline code\` work as you'd expect
- Use the toolbar or shortcuts: **Ctrl + B**, **Ctrl + I**, and **Ctrl + K** for links
- Press **Enter** at the end of a list item to start the next one

## Tags

Type a hashtag anywhere in a note, like #ideas, and it shows up in the sidebar so you can filter by it.

## Checklists

- [x] Open the welcome note
- [ ] Tick a box in the preview to see it update the text
- [ ] Create your first note

> Everything is saved in this browser as you type. Use the download button to export a note as a \`.md\` file.
`;

const PLAN = `# Weekly plan

Focus for the week: ship the pricing page and clean up the backlog. #planning

## Monday
- [x] Review pull requests
- [x] Sync with design on the checkout flow

## Tuesday
- [ ] Build the plan comparison table
- [ ] Write tests for the coupon logic

## Later this week
- [ ] Update the README
- [ ] Demo to the team on Thursday
`;

const READING = `# Reading list

Books and articles to get through this quarter. #books #learning

1. _Refactoring UI_ by Adam Wathan and Steve Schoger
2. _Don't Make Me Think_ by Steve Krug
3. [Web.dev: Learn accessibility](https://web.dev/learn/accessibility)

---

**Currently reading:** Don't Make Me Think. The chapter on scanning versus reading is worth a second look.
`;

const MEETING = `# Design review notes

Attendees: product, design, and frontend. #work

## Decisions
- Move the search bar into the header on every page
- Keep the empty states, but shorten the copy

## Code snippet from the discussion

\`\`\`ts
const isOverdue = (due: Date) => due.getTime() < Date.now();
\`\`\`

## Follow-ups
- [ ] Share updated mockups by Friday
- [ ] Check color contrast on the new badges
`;

export function createSampleNotes(): Note[] {
  return [
    { id: "note-welcome", content: WELCOME, pinned: true, createdAt: minutesAgo(30), updatedAt: minutesAgo(30) },
    { id: "note-plan", content: PLAN, pinned: false, createdAt: minutesAgo(60 * 26), updatedAt: minutesAgo(45) },
    { id: "note-meeting", content: MEETING, pinned: false, createdAt: minutesAgo(60 * 30), updatedAt: minutesAgo(60 * 5) },
    { id: "note-reading", content: READING, pinned: false, createdAt: minutesAgo(60 * 24 * 4), updatedAt: minutesAgo(60 * 24 * 3) },
  ];
}
