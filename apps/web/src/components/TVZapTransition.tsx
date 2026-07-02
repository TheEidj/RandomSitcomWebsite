import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function TVZapTransition() {
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only trigger animation if path actually changed
    if (previousPathRef.current !== location.pathname) {
      const overlay = overlayRef.current;
      if (overlay) {
        // Remove existing animation classes
        overlay.classList.remove("tv-zap-active");

        // Force reflow to restart animation
        void overlay.offsetWidth;

        // Add animation class
        overlay.classList.add("tv-zap-active");
      }

      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <>
      <div ref={overlayRef} className="tv-zap-overlay" />
      <style>{`
        .tv-zap-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
          pointer-events: none;
          background: black;
          opacity: 0;
        }

        .tv-zap-active {
          animation: tvZap 0.4s ease-in-out;
        }

        @keyframes tvZap {
          0% {
            clip-path: inset(50% 0 50% 0);
            opacity: 1;
          }
          50% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
          }
          100% {
            clip-path: inset(50% 0 50% 0);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
