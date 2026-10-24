import type { VirtualScrollData } from "lenis";

// Lets one component take over wheel input before Lenis applies it (the hero uses this to
// auto-play its sequence). A guard returns `false` to consume the event.
type Guard = (data: VirtualScrollData) => boolean;

let guard: Guard | null = null;

export function setScrollGuard(g: Guard | null) {
  guard = g;
}

export function runScrollGuard(data: VirtualScrollData) {
  return guard ? guard(data) : true;
}
