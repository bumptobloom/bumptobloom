import { Fragment } from 'react';

import { parseAnswer, type InlineSegment } from '@/lib/ask/format-answer';

function InlineText({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.bold ? (
          <strong key={index} className="font-semibold">
            {segment.text}
          </strong>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </>
  );
}

export function AskAnswer({ content }: { content: string }) {
  const blocks = parseAnswer(content);

  return (
    <div className="space-y-3">
      {blocks.map((block, blockIndex) => {
        if (block.kind === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';

          return (
            <ListTag
              key={blockIndex}
              className={`space-y-1 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'}`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <InlineText segments={item} />
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={blockIndex}>
            {block.lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                <InlineText segments={line} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
