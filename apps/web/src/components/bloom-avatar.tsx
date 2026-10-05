/**
 * Bloom's avatar, as drawn in Figma 05a and 05e: an amber tulip with two
 * green leaves on a pale moss disc.
 *
 * Drawn rather than set as an emoji. The nearest emoji, U+1F337, is pink on
 * every platform and the mark is amber, and emoji render differently on iOS,
 * Android and Windows, which is the same problem the tab bar had.
 *
 * Decorative: every caller already labels the message as being from Bloom,
 * so this is aria-hidden and contributes nothing to the accessible name.
 */
export function BloomAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="presentation"
      aria-hidden
      focusable="false"
    >
      <circle cx="20" cy="20" r="20" fill="var(--surface-moss)" />

      {/* Leaves sweep out past the bloom on both sides, drawn first so the
          petals sit over their inner ends. */}
      <path
        d="M20 26.8c-5 1-10.5-.2-14-3.2 4-1.8 9.6-1.2 13.2 1.6z"
        fill="#2aa04c"
      />
      <path
        d="M20 26.8c5 1 10.5-.2 14-3.2-4-1.8-9.6-1.2-13.2 1.6z"
        fill="#2aa04c"
      />

      {/* Outer petals fan away from the centre, then the centre petal on top. */}
      <path
        d="M19.2 27.2c-3.2-1-5.8-3.6-6.8-7-1-3.4 0-6.2 2-7.8 1.8 3.2 3 7 3.4 10.6.2 1.6.6 3 1.4 4.2z"
        fill="#e3a95c"
        stroke="#c2843c"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M20.8 27.2c3.2-1 5.8-3.6 6.8-7 1-3.4 0-6.2-2-7.8-1.8 3.2-3 7-3.4 10.6-.2 1.6-.6 3-1.4 4.2z"
        fill="#e3a95c"
        stroke="#c2843c"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 9.4c2.6 4 3.9 8.8 3.6 13.2-.2 2.4-1.4 4.3-3.6 5.4-2.2-1.1-3.4-3-3.6-5.4-.3-4.4 1-9.2 3.6-13.2z"
        fill="#e8b36c"
        stroke="#c2843c"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
