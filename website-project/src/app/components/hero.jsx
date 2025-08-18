"use client";

import React, { useEffect, useRef, useState } from "react";
import "./hero.css";

// some weird gsap importing issue
// this is a workaround to avoid SSR issues
let gsap, ScrollTrigger;
if (typeof window !== "undefined") {
  gsap = require("gsap/dist/gsap").gsap;
  ScrollTrigger = require("gsap/dist/ScrollTrigger").ScrollTrigger;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
}

// this should be in its own file for clarity in the future
function DigitColumn({ digit }) {
  return (
    <span className="digit-column" aria-hidden="true">
      <span
        className="digit-strip"
        style={{ transform: `translateY(calc(-1em * ${digit}))` }}
      >
        <span className="digit">0</span>
        <span className="digit">1</span>
        <span className="digit">2</span>
        <span className="digit">3</span>
        <span className="digit">4</span>
        <span className="digit">5</span>
        <span className="digit">6</span>
        <span className="digit">7</span>
        <span className="digit">8</span>
        <span className="digit">9</span>
      </span>
    </span>
  );
}

// this should probably be in its own file for clarity in the future
function RollingCounter({ value }) {
  // clamp to 0–99
  const v = Math.max(0, Math.min(99, Math.round(value)));

  const tens = Math.floor(v / 10);
  const ones = v % 10;

  return (
    <span className="rolling-counter">
      <span className="digits">
        <DigitColumn digit={tens} />
        <DigitColumn digit={ones} />
      </span>
      {/* <span className="percent-sign">%</span> */}
    </span>
  );
}

export default function BarePngSequence() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const imagesRef = useRef([]);

  const cardRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [target, setTarget] = useState(0);
  const [display, setDisplay] = useState(0);

  const [counterGone, setCounterGone] = useState(false);
  const [slideUp, setSlideUp] = useState(false);

  const rafRef = useRef(null);
  const hideQueuedRef = useRef(false);

  const BEAT_MS = 150; // tiny beat at 100%
  const COUNTER_FADE_MS = 250; // counter opacity fade duration
  const SLIDE_MS = 500; // overlay slide-up duration

  useEffect(() => {
    const animate = () => {
      setDisplay((d) => {
        const next = d + (target - d) * 0.2;
        const snapped = Math.abs(target - next) < 0.5 ? target : next;
        return snapped;
      });

      if (target >= 100 && Math.round(display) >= 100) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [target, display]);

  useEffect(() => {
    if (!gsap || !ScrollTrigger) return;

    const container = containerRef.current;
    const img = imageRef.current;
    const video = videoRef.current;
    const card = cardRef.current;
    if (!container || !img || !card) return;

    if (video) {
      video.play().catch((e) => {
        console.log("Video autoplay failed:", e);
      });
    }

    // load images
    const frameCount = 70;
    const images = [];
    let loaded = 0;

    const total = frameCount + (video ? 1 : 0);
    const updateProgress = () => {
      loaded++;
      const pct = Math.min(
        100,
        Math.round((loaded / Math.max(1, total)) * 100)
      );
      setTarget(pct);
    };

    for (let i = 0; i < frameCount; i++) {
      const frameNumber = String(i).padStart(4, "0");
      const src = `/videos/sequence_reduced/frame_${frameNumber}.png`;
      const image = new Image();
      image.src = src;

      if (image.complete) {
        updateProgress();
      } else {
        image.addEventListener("load", updateProgress, { once: true });
        image.addEventListener("error", updateProgress, { once: true });
      }

      images.push(image);
    }
    imagesRef.current = images;
    img.src = images[0].src;

    // video counts as one asset
    let cleanupVideo = () => {};
    if (video) {
      const onReady = () => updateProgress();
      if (video.readyState >= 2) {
        updateProgress();
      } else {
        video.addEventListener("loadeddata", onReady, { once: true });
        video.addEventListener("error", onReady, { once: true });
        cleanupVideo = () => {
          video.removeEventListener("loadeddata", onReady);
          video.removeEventListener("error", onReady);
        };
      }
    }

    const updateFrame = (progress) => {
      const totalFrames = imagesRef.current.length;
      const framePos = progress * (totalFrames - 1);
      const frameIndex = Math.floor(framePos);

      const image = imagesRef.current[frameIndex];
      if (image && img) {
        img.src = image.src;
      }
    };

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom top",
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        updateFrame(self.progress);

        // last 20% of the pinned range

        const p = Math.max(0, Math.min(1, (self.progress - 0.8) / 0.2));

        const lerp = (a, b, t) => a + (b - a) * t;

        gsap.set(card, {
          borderRadius: lerp(0, 28, p),
          scale: lerp(1, 0.94, p),

          transformOrigin: "center center",
          force3D: true,
        });
      },
      // markers: true,
    });

    const safety = setTimeout(() => setTarget(100), 10000);
    const onWindowLoad = () => {
      setTarget(100);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener("load", onWindowLoad);

    return () => {
      st.kill();
      cleanupVideo();
      clearTimeout(safety);
      window.removeEventListener("load", onWindowLoad);
    };
  }, []);

  useEffect(() => {
    if (Math.round(display) < 100 || !isLoading || hideQueuedRef.current)
      return;

    hideQueuedRef.current = true;

    const beat = setTimeout(() => {
      // fade out the numbers
      setCounterGone(true);

      // after numbers fade, slide the whole overlay up
      const slideTimer = setTimeout(() => {
        setSlideUp(true);

        // after slide completes, unmount the loader
        const unmountTimer = setTimeout(
          () => setIsLoading(false),
          SLIDE_MS + 40
        );

        return () => clearTimeout(unmountTimer);
      }, COUNTER_FADE_MS);

      return () => clearTimeout(slideTimer);
    }, BEAT_MS);

    return () => clearTimeout(beat);
  }, [display, isLoading]);

  const percent = Math.round(display);

  return (
    <>
      {isLoading && (
        <div
          className={[
            "preloader",
            counterGone ? "preloader--counter-gone" : "",
            slideUp ? "preloader--slide" : "",
          ]
            .join(" ")
            .trim()}
        >
          <div className="preloader__counter">
            <RollingCounter value={percent} />
          </div>
        </div>
      )}

      <div ref={containerRef} className="pngseq-container">
        <div ref={cardRef} className="pngseq-card">
          <div className="pngseq-stage">
            <video
              className="pngseq-bgvideo"
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
            >
              <source
                src="/videos/landscape-video3-1440p.mp4"
                type="video/mp4"
              />
            </video>
            <img ref={imageRef} className="pngseq-frame" alt="Frame" />
          </div>
        </div>
      </div>

      {/* dummy content */}
      <section className="after-content">
        <h2>dummy dummy dummy </h2>
        <p>
          dummy dummy dummydummy dummy dummydummy dummy dummydummy dummy
          dummydummy dummy dummydummy dummy dummydummy dummy dummydummy dummy
          dummydummy dummy dummydummy dummy dummydummy dummy dummydummy dummy
          dummydummy dummy dummydummy dummy dummydummy dummy dummy dummy dummy
          dummydummy dummy dummydummy dummy dummydummy dummy dumm
        </p>
      </section>
    </>
  );
}
