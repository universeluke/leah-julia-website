"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./title.css";

export default function Header() {
  const titleRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "+=300",
          scrub: 0.4,
          invalidateOnRefresh: true,
          // need to hide title on leave and show on enter back
          onLeave: () => gsap.set(titleRef.current, { display: "none" }),
          onEnterBack: () => gsap.set(titleRef.current, { display: "block" }),
        },
      });

      tl.fromTo(
        titleRef.current,
        { autoAlpha: 1, scale: 1, y: 0 }, // autoAlpha = opacity + visibility
        { autoAlpha: 0, scale: 1.3, y: 0, ease: "none" }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <header className="header">
      <h1 ref={titleRef} className="title">
        Leah Julia
      </h1>
    </header>
  );
}
