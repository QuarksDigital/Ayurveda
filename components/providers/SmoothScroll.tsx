"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { runScrollGuard } from "@/lib/scroll-guard";

gsap.registerPlugin(ScrollTrigger);

/** Keeps ScrollTrigger in step with Lenis and resets scroll on route change. */
function ScrollSync() {
  const lenis = useLenis(ScrollTrigger.update);
  const pathname = usePathname();

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname, lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  // Drive Lenis from GSAP's ticker so both share one clock. The instance is read
  // on every tick because ReactLenis creates it after this effect first runs.
  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.09, virtualScroll: runScrollGuard }}>
      <ScrollSync />
      {children}
    </ReactLenis>
  );
}
