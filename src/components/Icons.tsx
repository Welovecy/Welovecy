export function HeartIcon({ filled, size = 16 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2} aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}
export function GoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 11l18-8-8 18-2-8z" /></svg>
  );
}
export function PinIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></svg>
  );
}
export function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
  );
}
export function CamIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
  );
}
/** Mark: the sun as a heart over an olive branch that rolls like the sea. Colours from the Cyprus flag. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="64 80 384 384" aria-hidden="true">
      <path d="M256 316 C 200 278, 136 236, 136 172 C 136 130, 168 100, 206 100 C 230 100, 248 114, 256 134 C 264 114, 282 100, 306 100 C 344 100, 376 130, 376 172 C 376 236, 312 278, 256 316 Z" transform="translate(0 -6)" fill="var(--sun)" />
      <path d="M84.0 404.0 L87.2 400.2 L90.4 396.5 L93.6 392.8 L96.8 389.3 L100.0 385.8 L103.2 382.6 L106.4 379.5 L109.6 376.6 L112.8 374.0 L116.0 371.6 L119.2 369.6 L122.4 367.8 L125.6 366.4 L128.8 365.3 L132.0 364.5 L135.2 364.1 L138.4 364.0 L141.6 364.3 L144.8 365.0 L148.0 366.0 L151.2 367.3 L154.4 368.9 L157.6 370.9 L160.8 373.2 L164.0 375.7 L167.2 378.5 L170.4 381.5 L173.6 384.7 L176.8 388.1 L180.0 391.6 L183.2 395.3 L186.4 399.0 L189.6 402.7 L192.8 406.5 L196.0 410.3 L199.2 413.9 L202.4 417.5 L205.6 421.0 L208.8 424.4 L212.0 427.5 L215.2 430.5 L218.4 433.2 L221.6 435.6 L224.8 437.8 L228.0 439.6 L231.2 441.2 L234.4 442.4 L237.6 443.3 L240.8 443.8 L244.0 444.0 L247.2 443.8 L250.4 443.3 L253.6 442.4 L256.8 441.2 L260.0 439.6 L263.2 437.8 L266.4 435.6 L269.6 433.2 L272.8 430.5 L276.0 427.5 L279.2 424.4 L282.4 421.0 L285.6 417.5 L288.8 413.9 L292.0 410.3 L295.2 406.5 L298.4 402.7 L301.6 399.0 L304.8 395.3 L308.0 391.6 L311.2 388.1 L314.4 384.7 L317.6 381.5 L320.8 378.5 L324.0 375.7 L327.2 373.2 L330.4 370.9 L333.6 368.9 L336.8 367.3 L340.0 366.0 L343.2 365.0 L346.4 364.3 L349.6 364.0 L352.8 364.1 L356.0 364.5 L359.2 365.3 L362.4 366.4 L365.6 367.8 L368.8 369.6 L372.0 371.6 L375.2 374.0 L378.4 376.6 L381.6 379.5 L384.8 382.6 L388.0 385.8 L391.2 389.3 L394.4 392.8 L397.6 396.5 L400.8 400.2 L404.0 404.0" fill="none" stroke="var(--olive)" strokeWidth="30" strokeLinecap="round" />
    </svg>
  );
}
