/**
 * Stops the page behind a sheet or dialog from scrolling (including iOS/Android
 * touch scrolling), without jumping: the body is pinned at the current scroll
 * offset and restored on unlock. Reference-counted for nested overlays.
 */
let locks = 0;
let saved: { y: number; style: string } | null = null;

export function lockScroll(): () => void {
  if (typeof document === "undefined") return () => undefined;
  const body = document.body;
  if (locks === 0) {
    const y = window.scrollY;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    saved = { y, style: body.getAttribute("style") ?? "" };
    Object.assign(body.style, {
      position: "fixed",
      top: `-${y}px`,
      left: "0",
      right: "0",
      width: "100%",
      overflow: "hidden",
      paddingInlineEnd: gap > 0 ? `${gap}px` : body.style.paddingInlineEnd,
    });
  }
  locks++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0 && saved) {
      const { y, style } = saved;
      saved = null;
      if (style) body.setAttribute("style", style);
      else body.removeAttribute("style");
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    }
  };
}
