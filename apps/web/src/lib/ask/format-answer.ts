/**
 * Turns the Markdown-style text the model returns (**bold**, bullet and
 * numbered lists, the odd ### heading) into plain data that the Ask chat
 * renders as React elements. No HTML string is ever produced or injected,
 * so model output can never become markup on the page.
 */

export type InlineSegment = { text: string; bold: boolean };

export type AnswerBlock =
  | { kind: 'paragraph'; lines: InlineSegment[][] }
  | { kind: 'list'; ordered: boolean; items: InlineSegment[][] };

const BULLET = /^[-*•]\s+(.*)$/;
const NUMBERED = /^\d+[.)]\s+(.*)$/;
const HEADING = /^#{1,6}\s+(.*)$/;

export function parseInline(text: string): InlineSegment[] {
  // split() with a capture group alternates plain text and bold text.
  return text
    .split(/\*\*(.+?)\*\*/)
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter((segment) => segment.text !== '');
}

export function parseAnswer(content: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let afterBlankLine = true;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line === '') {
      afterBlankLine = true;
      continue;
    }

    const previous = blocks[blocks.length - 1];
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const listItem = bullet ?? numbered;

    if (listItem) {
      const ordered = numbered !== null;
      const item = parseInline(listItem[1] ?? '');

      if (previous?.kind === 'list' && previous.ordered === ordered) {
        previous.items.push(item);
      } else {
        blocks.push({ kind: 'list', ordered, items: [item] });
      }
    } else {
      const heading = HEADING.exec(line);
      const segments = heading
        ? [{ text: (heading[1] ?? '').replace(/\*\*/g, ''), bold: true }]
        : parseInline(line);

      if (!afterBlankLine && previous?.kind === 'paragraph') {
        previous.lines.push(segments);
      } else {
        blocks.push({ kind: 'paragraph', lines: [segments] });
      }
    }

    afterBlankLine = false;
  }

  return blocks;
}
