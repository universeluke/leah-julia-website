"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./title.css";

export default function Header() {
  const stackRef = useRef(null); // fixed stack container
  const titleRef = useRef(null);
  const cueRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const targets = [titleRef.current, cueRef.current];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "+=300",
          scrub: 0.4,
          invalidateOnRefresh: true,
          onLeave: () => gsap.set(stackRef.current, { display: "none" }),
          onEnterBack: () => gsap.set(stackRef.current, { display: "flex" }),
        },
      });

      tl.fromTo(
        targets,
        { autoAlpha: 1, scale: 1, y: 0 },
        { autoAlpha: 0, scale: 1.2, y: 0, ease: "none" } // edit scale depending on zom
      );
    });

    return () => ctx.revert();
  }, []);

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <header className="header">
      <div ref={stackRef} className="heroStack" aria-hidden="false">
        <h1 ref={titleRef} className="title" aria-label="Leah Julia">
          Leah Julia
        </h1>

        <button
          ref={cueRef}
          className="scrollCue"
          aria-label="Scroll down to explore"
          onClick={scrollDown}
        >
          {/* <span className="scrollCue__text">Scroll down to explore</span> */}

          <svg
            className="scrollCue__chevron"
            width="72"
            height="28"
            viewBox="0 0 72 28"
            aria-hidden="true"
          >
            <path
              d="M6 6 L36 22 L66 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
