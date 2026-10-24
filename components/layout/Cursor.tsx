"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

// Only devices whose *primary* input can hover with precision (mouse / trackpad).
// Phones and touch tablets fail this and keep their native behaviour.
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const INTERACTIVE = 'a, button, [role="button"], summary, label, select, [data-cursor="hover"]';
const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]), textarea, [contenteditable="true"]';

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export default function Cursor() {
  const fine = useMedia(FINE_POINTER);
  return fine ? <CursorInner /> : null;
}

function CursorInner() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const reduceMotion = useMedia("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("has-custom-cursor");

    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100, s: 1 };
    let visible = false;
    let hovering = false;
    let pressed = false;
    let inField = false;

    const setVisible = (v: boolean) => {
      visible = v;
      const o = v && !inField ? "1" : "0";
      if (dot.current) dot.current.style.opacity = o;
      if (ring.current) ring.current.style.opacity = o;
    };

    const onMove = (e: PointerEvent) => {
      // Hybrid laptops: a touch on the screen hides the cursor until the mouse moves again.
      if (e.pointerType === "touch") return setVisible(false);
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        ringPos.x = target.x;
        ringPos.y = target.y;
        setVisible(true);
      }
    };
    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      hovering = !!el?.closest?.(INTERACTIVE);
      inField = !!el?.closest?.(TEXT_FIELD);
      setVisible(visible);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return setVisible(false);
      pressed = true;
    };
    const onUp = () => (pressed = false);
    const onLeave = (e: MouseEvent) => !e.relatedTarget && setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseout", onLeave);

    const tick = (_t: number, dtMs: number) => {
      // frame-rate independent easing; the ring trails the dot for a soft inertia
      const k = reduceMotion ? 1 : 1 - Math.pow(1 - 0.16, dtMs / 16.67);
      ringPos.x += (target.x - ringPos.x) * k;
      ringPos.y += (target.y - ringPos.y) * k;
      const big = hovering || html.dataset.cursor === "hover";
      const s = pressed ? 0.8 : big ? 1.8 : 1;
      ringPos.s += (s - ringPos.s) * (reduceMotion ? 1 : 1 - Math.pow(1 - 0.2, dtMs / 16.67));
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${ringPos.s})`;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%) scale(${big ? 0 : 1})`;
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onLeave);
      html.classList.remove("has-custom-cursor");
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] mix-blend-difference">
      <div ref={ring} className="absolute left-0 top-0 h-9 w-9 rounded-full border border-white opacity-0 transition-opacity duration-300" />
      <div ref={dot} className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-white opacity-0 transition-[opacity] duration-300" />
    </div>
  );
}
