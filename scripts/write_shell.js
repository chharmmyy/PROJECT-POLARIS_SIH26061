const fs = require('fs');

const code = `"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// Client-only 3D Wind Turbine hero (WebGL)
const PolarisHero = dynamic(() => import("./polaris-hero"), { ssr: false });

// Distant horizon SVG wind turbines for scale
function DistantTurbine({ x, h, delay, opacity }: { x: string; h: number; delay: string; opacity?: number }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute bottom-[4%] transition-opacity duration-700"
      style={{ left: x, height: h, opacity: opacity ?? 0.65 }}
      viewBox="0 0 100 200"
    >
      <path d="M48 200 L50 62 L52 200Z" fill="#d9e6f7" />
      <g className="turbine-rotor" style={{ transformOrigin: "50px 60px", animationDelay: delay }}>
        {[0, 120, 240].map((r) => (
          <path
            key={r}
            transform={`rotate(${r} 50 60)`}
            d="M50 60 C46.5 40 48 20 50 4 C52 20 53.5 40 50 60Z"
            fill="#edf4fd"
          />
        ))}
      </g>
      <circle cx="50" cy="60" r="3.2" fill="#94a3b8" />
      {/* Tiny red obstacle beacon */}
      <circle cx="50" cy="56" r="1.5" fill="#ef4444" className="animate-pulse" />
    </svg>
  );
}

// Multi-depth realistic polar snow drift animation
function AtmosphericSnow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let animId = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = canvas.width = parent.clientWidth;
      height = canvas.height = parent.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Flake count responsive to screen width
    const count = window.innerWidth < 768 ? 90 : 180;

    interface Flake {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      phase: number;
      phaseSpeed: number;
      opacity: number;
      layer: number; // 0 = background, 1 = midground, 2 = foreground
    }

    const flakes: Flake[] = Array.from({ length: count }, () => {
      const layer = Math.random() < 0.25 ? 2 : Math.random() < 0.65 ? 1 : 0;
      let radius = 1.0;
      let speedY = 0.6;
      let opacity = 0.6;

      if (layer === 0) {
        radius = 0.7 + Math.random() * 0.8;
        speedY = 0.35 + Math.random() * 0.45;
        opacity = 0.3 + Math.random() * 0.35;
      } else if (layer === 1) {
        radius = 1.4 + Math.random() * 1.2;
        speedY = 0.7 + Math.random() * 0.75;
        opacity = 0.6 + Math.random() * 0.3;
      } else {
        radius = 2.6 + Math.random() * 1.6;
        speedY = 1.2 + Math.random() * 0.9;
        opacity = 0.45 + Math.random() * 0.35;
      }

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        speedY,
        speedX: 0.25 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.008 + Math.random() * 0.015,
        opacity,
        layer
      };
    });

    let windTime = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      windTime += 0.01;
      const windGust = Math.sin(windTime * 0.5) * 0.35;

      for (const f of flakes) {
        f.y += f.speedY;
        f.phase += f.phaseSpeed;
        f.x += Math.sin(f.phase) * 0.5 + f.speedX + windGust;

        if (f.y > height + 8) {
          f.y = -6;
          f.x = Math.random() * width;
        }
        if (f.x > width + 10) {
          f.x = -10;
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = \`rgba(255, 255, 255, \${f.opacity})\`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[15]"
    />
  );
}

export default function HeroShell() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#050e24] via-[#1a3469] via-60% to-[#8ea8cc]">
      {/* Distant background scale turbines on the horizon */}
      <DistantTurbine x="4%" h={130} delay="-1s" opacity={0.4} />
      <DistantTurbine x="17%" h={95} delay="-3.5s" opacity={0.32} />
      <DistantTurbine x="29%" h={75} delay="-2s" opacity={0.25} />

      {/* Main 3D Wind Turbine Hero & Nav */}
      <PolarisHero theme="light" />

      {/* Atmospheric Multi-Depth Snowfall Layer */}
      <AtmosphericSnow />

      {/* Realistic polar ice fog transition into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[16] h-28 bg-gradient-to-b from-transparent via-white/50 to-white" />
    </section>
  );
}
`;

fs.writeFileSync('components/polaris/hero-shell.tsx', code, 'utf8');
console.log('Saved components/polaris/hero-shell.tsx without BOM');
