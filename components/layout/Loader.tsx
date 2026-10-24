"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { done, progress, subscribe, track } from "@/lib/preload";
import Logo from "./Logo";

const MIN_MS = 800; // never flash: show at least this long
const MAX_MS = 12000; // never hang: reveal anyway after this

function preloadImages() {
  const urls = new Set<string>();
  document.querySelectorAll("img").forEach((img) => {
    const src = img.currentSrc || img.src;
    if (src) urls.add(src);
  });
  return Promise.all(
    [...urls].map(
      (src) =>
        new Promise<void>((resolve) => {
          const im = new Image();
          im.onload = im.onerror = () => resolve();
          im.src = src;
        })
    )
  );
}

export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useLayoutEffect(() => {
    // Always start from the top: the hero is scroll-driven and should play from its start.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.classList.add("is-loading");

    track("fonts");
    track("window");
    track("images");
    document.fonts.ready.then(() => done("fonts"));
    if (document.readyState === "complete") done("window");
    else window.addEventListener("load", () => done("window"), { once: true });
    requestAnimationFrame(() => preloadImages().then(() => done("images")));

    const start = performance.now();
    const shown = { value: 0 };
    let finished = false;

    const render = () => {
      const pct = Math.round(shown.value * 100);
      if (counter.current) counter.current.textContent = String(pct);
      if (bar.current) bar.current.style.transform = `scaleX(${shown.value})`;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      unsubscribe();
      clearTimeout(failsafe);
      gsap
        .timeline()
        .to(shown, { value: 1, duration: 0.35, ease: "power2.out", onUpdate: render })
        .to("[data-loader-content]", { autoAlpha: 0, y: -16, duration: 0.35, ease: "power2.in" }, "+=0.1")
        .to(root.current, { yPercent: -100, duration: 0.75, ease: "power4.inOut" }, "-=0.1")
        .add(() => {
          document.documentElement.classList.remove("is-loading");
          window.scrollTo(0, 0);
          lenisRef.current?.start();
          ScrollTrigger.refresh();
          setGone(true);
        });
    };

    const update = () => {
      gsap.to(shown, { value: progress() * 0.95, duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: render });
      if (progress() === 1) {
        const wait = Math.max(0, MIN_MS - (performance.now() - start));
        setTimeout(finish, wait);
      }
    };

    const unsubscribe = subscribe(update);
    const failsafe = setTimeout(finish, MAX_MS);
    update();

    return () => {
      unsubscribe();
      clearTimeout(failsafe);
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  // Hold Lenis while the loader is up.
  useLayoutEffect(() => {
    if (!gone) lenis?.stop();
  }, [lenis, gone]);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100] bg-black text-[#f5f5f7]" role="status" aria-live="polite" aria-label="Loading">
      <div data-loader-content className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-[#c9a45c]">
          <Logo height={56} className="animate-pulse" />
          <p className="tagline text-lg text-[#c9a45c]/80">The Art of Inner Harmony</p>
        </div>
        <div className="container-x flex items-end justify-between pb-8">
          <p className="text-sm text-white/40">Preparing your experience</p>
          <p className="headline text-5xl tabular-nums md:text-6xl">
            <span ref={counter}>0</span>
            <span className="text-white/30">%</span>
          </p>
        </div>
        <div className="h-px w-full bg-white/10">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-[#c9a45c]" />
        </div>
      </div>
    </div>
  );
}
