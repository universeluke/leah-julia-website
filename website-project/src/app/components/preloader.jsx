// import { useEffect, useMemo, useRef, useState } from "react";
// import "./Preloader.css"; // import the CSS file

// export default function Preloader({
//   scope = null,
//   minShowMs = 600,
//   maxWaitMs = 10000,
//   onDone,
//   className = "",
// }) {
//   const [target, setTarget] = useState(0);
//   const [display, setDisplay] = useState(0);
//   const [hidden, setHidden] = useState(false);
//   const startedAt = useRef(performance.now());
//   const raf = useRef(null);
//   const doneTimer = useRef(null);

//   const images = useMemo(() => {
//     const root = scope ?? document;
//     return Array.from(root.querySelectorAll?.("img") ?? document.images ?? []);
//   }, [scope]);

//   useEffect(() => {
//     const animate = () => {
//       setDisplay((d) => {
//         const next = d + (target - d) * 0.2;
//         return Math.abs(target - next) < 0.5 ? target : next;
//       });
//       raf.current = requestAnimationFrame(animate);
//     };
//     raf.current = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(raf.current);
//   }, [target]);

//   useEffect(() => {
//     const total = images.length;
//     if (total === 0) {
//       setTarget(100);
//       return;
//     }

//     let loaded = 0;
//     const onOneDone = () => {
//       loaded++;
//       setTarget(Math.min(100, Math.round((loaded / total) * 100)));
//     };

//     const cleanupFns = [];
//     images.forEach((img) => {
//       if (img.complete) onOneDone();
//       else {
//         const onLoad = () => onOneDone();
//         const onError = () => onOneDone();
//         img.addEventListener("load", onLoad, { once: true });
//         img.addEventListener("error", onError, { once: true });
//         cleanupFns.push(() => {
//           img.removeEventListener("load", onLoad);
//           img.removeEventListener("error", onError);
//         });
//       }
//     });

//     const onWindowLoad = () => setTarget(100);
//     window.addEventListener("load", onWindowLoad);
//     const safety = setTimeout(() => setTarget(100), maxWaitMs);

//     return () => {
//       cleanupFns.forEach((fn) => fn());
//       window.removeEventListener("load", onWindowLoad);
//       clearTimeout(safety);
//     };
//   }, [images, maxWaitMs]);

//   useEffect(() => {
//     if (Math.round(display) < 100 || hidden) return;
//     const elapsed = performance.now() - startedAt.current;
//     const wait = Math.max(0, minShowMs - elapsed);

//     doneTimer.current = setTimeout(() => {
//       setHidden(true);
//       setTimeout(() => onDone && onDone(), 420);
//     }, wait);

//     return () => clearTimeout(doneTimer.current);
//   }, [display, hidden, minShowMs, onDone]);

//   if (hidden) return null;

//   const percent = Math.round(display);

//   return (
//     <div
//       aria-hidden="true"
//       className={`preloader ${
//         percent >= 100 ? "preloader--done" : ""
//       } ${className}`}
//     >
//       <div className="preloader__counter">{percent}%</div>
//     </div>
//   );
// }
