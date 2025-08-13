"use client";

import { useEffect, useRef } from "react";
import "./hero.css";

let gsap, ScrollTrigger;
if (typeof window !== "undefined") {
  gsap = require("gsap/dist/gsap").gsap;
  ScrollTrigger = require("gsap/dist/ScrollTrigger").ScrollTrigger;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
}

export default function BarePngSequence() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const imagesRef = useRef([]);

  useEffect(() => {
    if (!gsap || !ScrollTrigger) return;

    const container = containerRef.current;
    const img = imageRef.current;
    const video = videoRef.current;
    if (!container || !img) return;

    // try to play the video
    if (video) {
      video.play().catch((e) => {
        console.log("Video autoplay failed:", e);
      });
    }

    const loadImages = () => {
      const images = [];

      for (let i = 0; i <= 140; i++) {
        const frameNumber = String(i).padStart(4, "0");
        const src = `/videos/sequence/frame_${frameNumber}.png`;

        const image = new Image();
        image.src = src;
        images.push(image);

        console.log("Loading:", src);
      }

      imagesRef.current = images;

      img.src = images[0].src;
    };

    loadImages();

    const updateFrame = (progress) => {
      const frameIndex = Math.floor(progress * 140); // 0 to 140 (for 141 frames)
      const image = imagesRef.current[frameIndex];

      if (image && img) {
        img.src = image.src;
        console.log("Frame:", frameIndex + 1, "Progress:", progress);
      }
    };

    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom top",
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        updateFrame(self.progress);
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div>
      <div ref={containerRef} className="pngseq-container">
        <video
          className="pngseq-bgvideo"
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/landscape-video-1440p.mp4" type="video/mp4" />
        </video>

        <img ref={imageRef} className="pngseq-frame" alt="Frame" />
      </div>
    </div>
  );
}
