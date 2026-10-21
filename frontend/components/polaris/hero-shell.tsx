"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// Client-only 3D Wind Turbine hero (WebGL)
const PolarisHero = dynamic(() => import("./polaris-hero"), { ssr: false });

function DistantTurbine({
  x,
  h,
  delay,
  opacity = 0.7,
  hasRedStripes = true
}: {
  x: string;
  h: number;
  delay: string;
  opacity?: number;
  hasRedStripes?: boolean;
}) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute bottom-[6%] select-none z-[12]"
      style={{ left: x, height: h, opacity }}
      viewBox="0 0 100 240"
    >
      {/* Tapered Monolithic Tower */}
      <path d="M47.5 240 L49.2 60 L50.8 60 L52.5 240Z" fill="#f1f6fc" />
      <path d="M49.2 60 L50.8 60 L52.5 240 L51.2 240Z" fill="#d5e3f3" opacity="0.6" />
      
      {/* Nacelle housing */}
      <rect x="46" y="56" width="13" height="6.5" rx="2" fill="#f8faff" />
      <path d="M46 56 L43 59.25 L46 62.5Z" fill="#e2edf8" />
      
      {/* Rotor & 3 Blades with multi-band red safety stripes */}
      <g className="turbine-rotor" style={{ transformOrigin: "47px 59.25px", animationDelay: delay }}>
        {[0, 120, 240].map((r) => (
          <g key={r} transform={`rotate(${r} 47 59.25)`}>
            {/* Blade body */}
            <path
              d="M47 59.25 C44.5 40 45.5 20 47 3 C48.5 20 49.5 40 47 59.25Z"
              fill="#ffffff"
            />
            {hasRedStripes && (
              <>
                {/* Red stripe 1 */}
                <path d="M45.6 28 C45.9 24 48.1 24 48.4 28Z" fill="#ef3232" />
                {/* Red stripe 2 */}
                <path d="M46.1 19 C46.4 15 47.6 15 47.9 19Z" fill="#ef3232" />
                {/* Red tip */}
                <path d="M46.6 9 C46.8 4 47.2 4 47.4 9Z" fill="#ef3232" />
              </>
            )}
          </g>
        ))}
      </g>
      {/* Hub nose cone & strobe */}
      <circle cx="47" cy="59.25" r="3.2" fill="#e8f2fc" />
      <circle cx="47" cy="59.25" r="1.5" fill="#cbdcf0" />
      <circle cx="56" cy="55.5" r="1.0" fill="#ff2222" opacity="0.85" />
    </svg>
  );
}

// Distant Power Transmission Pylon
function DistantPylon({ x, h, opacity = 0.25 }: { x: string; h: number; opacity?: number }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute bottom-[6%] select-none z-[11]"
      style={{ left: x, height: h, opacity }}
      viewBox="0 0 60 120"
      fill="none"
      stroke="#7b9cc4"
      strokeWidth="1.5"
    >
      <path d="M15 120 L27 15 L33 15 L45 120" />
      <line x1="20" y1="90" x2="40" y2="90" />
      <line x1="23" y1="65" x2="37" y2="65" />
      <line x1="26" y1="40" x2="34" y2="40" />
      <line x1="20" y1="90" x2="37" y2="65" />
      <line x1="40" y1="90" x2="23" y2="65" />
      <line x1="23" y1="65" x2="34" y2="40" />
      <line x1="37" y1="65" x2="26" y2="40" />
      <line x1="8" y1="35" x2="52" y2="35" strokeWidth="1.8" />
      <line x1="12" y1="58" x2="48" y2="58" strokeWidth="1.8" />
      <line x1="16" y1="80" x2="44" y2="80" strokeWidth="1.8" />
    </svg>
  );
}

function AtmosphericSnow() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0, h = 0, id = 0;
    const fit = () => {
      const p = c.parentElement;
      if (!p) return;
      w = c.width = p.clientWidth;
      h = c.height = p.clientHeight;
    };
    fit();
    window.addEventListener("resize", fit);

    const n = window.innerWidth < 768 ? 45 : 90;
    const flakes = Array.from({ length: n }, () => {
      const layer = Math.random() < 0.3 ? 1 : 0;
      let r = 1.0, v = 0.4, op = 0.4;
      if (layer === 0) {
        r = 0.6 + Math.random() * 0.8;
        v = 0.25 + Math.random() * 0.3;
        op = 0.25 + Math.random() * 0.3;
      } else {
        r = 1.6 + Math.random() * 1.2;
        v = 0.55 + Math.random() * 0.5;
        op = 0.4 + Math.random() * 0.3;
      }
      return {
        x: Math.random() * (w || 1200),
        y: Math.random() * (h || 800),
        r,
        v,
        driftX: 0.15 + Math.random() * 0.35,
        p: Math.random() * 6.28,
        pSpeed: 0.006 + Math.random() * 0.012,
        op,
      };
    });

    let time = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.01;
      const wind = Math.sin(time * 0.3) * 0.25;

      for (const s of flakes) {
        s.y += s.v;
        s.p += s.pSpeed;
        s.x += Math.sin(s.p) * 0.4 + s.driftX + wind;

        if (s.y > h + 8) {
          s.y = -6;
          s.x = Math.random() * w;
        }
        if (s.x > w + 10) {
          s.x = -10;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.28);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.op})`;
        ctx.fill();
      }
      id = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[22]" />;
}

export default function HeroShell() {
  return (
    <section className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-[#0d224e] via-[#1d4c8d] via-[#4d82c2] to-[#b4d2ee] flex flex-col">
      {/* Distant Pylons */}
      <DistantPylon x="7%" h={85} opacity={0.22} />
      <DistantPylon x="18%" h={70} opacity={0.16} />

      {/* Distant Wind Farm Array (matching reference photo across horizon) */}
      <DistantTurbine x="3%" h={105} delay="-1s" opacity={0.45} />
      <DistantTurbine x="12%" h={140} delay="-4s" opacity={0.65} />
      <DistantTurbine x="20%" h={115} delay="-2.5s" opacity={0.50} />
      <DistantTurbine x="28%" h={155} delay="-6s" opacity={0.72} />
      <DistantTurbine x="36%" h={185} delay="-3s" opacity={0.82} />
      <DistantTurbine x="44%" h={125} delay="-1.5s" opacity={0.48} />

      {/* Main Foreground 3D Wind Turbine & Hero Interactive Content */}
      <PolarisHero theme="light" />

      {/* Atmospheric Soft Drifting Snow specks */}
      <AtmosphericSnow />

      {/* Realistic Billowing White Cloud Mist Horizon along bottom (matching reference image) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[18] h-32 sm:h-44 bg-gradient-to-t from-white/95 via-white/70 to-transparent backdrop-blur-[1px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[19] h-16 sm:h-24 bg-gradient-to-t from-white via-white/80 to-transparent"
      />
    </section>
  );
}


