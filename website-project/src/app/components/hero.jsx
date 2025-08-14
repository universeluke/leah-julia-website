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

    if (video) {
      video.play().catch((e) => {
        console.log("Video autoplay failed:", e);
      });
    }

    // load images
    // reduced frames to be used with zoom effect
    const frameCount = 70;
    const images = [];
    for (let i = 0; i < frameCount; i++) {
      const frameNumber = String(i).padStart(4, "0");
      const src = `/videos/sequence_reduced/frame_${frameNumber}.png`;
      const image = new Image();
      image.src = src;
      images.push(image);
    }
    imagesRef.current = images;
    img.src = images[0].src;

    const updateFrame = (progress) => {
      const totalFrames = imagesRef.current.length;
      const framePos = progress * (totalFrames - 1); // fractional index
      const frameIndex = Math.floor(framePos);

      const image = imagesRef.current[frameIndex];
      if (image && img) {
        img.src = image.src;
      }

      // calculate zoom effect
      // const betweenProgress = framePos - frameIndex;
      // const scale = 1 + betweenProgress * 0.01; // 0.01 = 1% zoom per frame
      // img.style.transform = `scale(${scale})`;
      // img.style.transformOrigin = "center center";
    };

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom top",
      pin: true,
      scrub: true,
      onUpdate: (self) => updateFrame(self.progress),
    });

    return () => {
      trigger.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <div className="white-box"></div>
      <div ref={containerRef} className="pngseq-container">
        <div className="pngseq-stage">
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
    </>
  );
}
