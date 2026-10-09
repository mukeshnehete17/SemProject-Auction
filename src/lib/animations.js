"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let isRegistered = false;

export function registerGsap() {
  if (typeof window !== "undefined" && !isRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    isRegistered = true;
  }
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Reusable hero animation hook for editorial title, elements, and subtle parallax.
 */
export function useGsapHero(scopeRef) {
  useEffect(() => {
    if (!scopeRef.current || prefersReducedMotion()) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-sub]", {
        opacity: 0,
        y: 16,
        duration: 0.6,
        delay: 0.05,
      })
        .from(
          "[data-hero-title]",
          {
            opacity: 0,
            y: 30,
            duration: 0.85,
            stagger: 0.08,
          },
          "-=0.35"
        )
        .from(
          "[data-hero-desc]",
          {
            opacity: 0,
            y: 16,
            duration: 0.65,
          },
          "-=0.55"
        )
        .from(
          "[data-hero-actions]",
          {
            opacity: 0,
            y: 14,
            duration: 0.55,
          },
          "-=0.45"
        )
        .from(
          "[data-hero-card]",
          {
            opacity: 0,
            y: 36,
            scale: 0.98,
            duration: 0.9,
            ease: "power2.out",
          },
          "-=0.6"
        )
        .from(
          "[data-hero-meta]",
          {
            opacity: 0,
            y: 12,
            duration: 0.55,
            stagger: 0.06,
          },
          "-=0.5"
        );

      // Subtle scroll parallax on hero auction card
      gsap.to("[data-hero-card]", {
        y: 32,
        ease: "none",
        scrollTrigger: {
          trigger: scopeRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef]);
}

/**
 * Scroll reveal hook that animates elements smoothly as they enter the viewport.
 */
export function useGsapScrollReveal(scopeRef, selector = "[data-reveal]") {
  useEffect(() => {
    if (!scopeRef.current || prefersReducedMotion()) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray(selector);
      elements.forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          opacity: 0,
          y: 24,
          duration: 0.75,
          ease: "power2.out",
        });
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef, selector]);
}

/**
 * Staggered animation for grid items on scroll.
 */
export function useGsapStagger(scopeRef, selector = "[data-stagger-item]") {
  useEffect(() => {
    if (!scopeRef.current || prefersReducedMotion()) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray(selector);
      if (items.length === 0) return;

      gsap.from(items, {
        scrollTrigger: {
          trigger: scopeRef.current,
          start: "top 82%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 22,
        duration: 0.65,
        stagger: 0.07,
        ease: "power2.out",
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef, selector]);
}

/**
 * Animated count-up hook for platform stats.
 */
export function useCountUp(numberRef, targetValue, duration = 1.4) {
  useEffect(() => {
    if (!numberRef.current || prefersReducedMotion() || typeof targetValue !== "number") return;
    registerGsap();

    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetValue,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: numberRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.textContent = Math.round(obj.val).toLocaleString("en-IN");
          }
        },
      });
    }, numberRef);

    return () => ctx.revert();
  }, [numberRef, targetValue, duration]);
}
