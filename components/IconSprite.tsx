/** Shared line-icon defs, referenced elsewhere via <svg><use href="#g-*" /></svg>. Render this
 *  once near the root of the page. Original line-illustration set from the approved wireframe —
 *  not stock icons, not product photography. */
export default function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <g id="g-tee" fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" strokeLinecap="round">
          <path d="M8 7 5 9l1.5 3 1.5-.8V20h8V11.2l1.5.8L19 9l-3-2-1.5 1A2.5 2.5 0 0 1 12 9.4 2.5 2.5 0 0 1 9.5 8L8 7Z" />
        </g>
        <g id="g-jacket" fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" strokeLinecap="round">
          <path d="M8 6 5 8l1 4 1.3-.5V20h9.4v-8.5l1.3.5 1-4-3-2-2 1.2V20M12 7l-2-1M12 7l2-1M12 7v3" />
        </g>
        <g id="g-pants" fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" strokeLinecap="round">
          <path d="M8 4h8l-.4 8L14 21h-2.2L12 13l-.2 8H9.6L8.4 12 8 4Z" />
        </g>
        <g id="g-dress" fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" strokeLinecap="round">
          <path d="M9 4l3 2 3-2 1.5 4L15 9l2 11H7l2-11-1.5-1L9 4Z" />
        </g>
        <g id="g-bag" fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" strokeLinecap="round">
          <path d="M7 9h10l1 11H6L7 9ZM9.5 9V7a2.5 2.5 0 0 1 5 0v2" />
        </g>
        <g id="g-shoe" fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" strokeLinecap="round">
          <path d="M3 15c2 .3 4-.3 5.5-2L10 16h9a2 2 0 0 1 2 2v1H3v-4Z" />
        </g>
        <g id="g-sparkle" fill="currentColor">
          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        </g>
      </defs>
    </svg>
  );
}
