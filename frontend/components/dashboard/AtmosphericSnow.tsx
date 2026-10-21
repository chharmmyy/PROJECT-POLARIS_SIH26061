"use client";

import React, { useEffect, useRef } from 'react';

export default function AtmosphericSnow() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let w = 0;
    let h = 0;
    let id = 0;

    const fit = () => {
      const p = c.parentElement;
      if (!p) return;
      w = c.width = p.clientWidth;
      h = c.height = p.clientHeight;
    };
    fit();
    window.addEventListener('resize', fit);

    // More visible, crisp, multi-layered snow particles
    const count = window.innerWidth < 768 ? 65 : 130;
    const flakes = Array.from({ length: count }, () => {
      // 3 layers of depth: 0 = background, 1 = midground, 2 = foreground glowing
      const layerType = Math.random();
      let r = 1.2;
      let v = 0.5;
      let op = 0.6;
      let glow = false;

      if (layerType < 0.4) {
        // Far background soft snow
        r = 0.8 + Math.random() * 1.0;
        v = 0.3 + Math.random() * 0.4;
        op = 0.4 + Math.random() * 0.3;
        glow = false;
      } else if (layerType < 0.8) {
        // Midground crisp flakes
        r = 1.8 + Math.random() * 1.4;
        v = 0.6 + Math.random() * 0.6;
        op = 0.65 + Math.random() * 0.25;
        glow = false;
      } else {
        // Foreground luminous crystal flakes
        r = 2.8 + Math.random() * 1.8;
        v = 0.9 + Math.random() * 0.8;
        op = 0.8 + Math.random() * 0.2;
        glow = true;
      }

      return {
        x: Math.random() * (w || 1400),
        y: Math.random() * (h || 900),
        r,
        v,
        driftX: 0.2 + Math.random() * 0.4,
        p: Math.random() * Math.PI * 2,
        pSpeed: 0.008 + Math.random() * 0.015,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        op,
        glow,
      };
    });

    let time = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.01;
      const wind = Math.sin(time * 0.4) * 0.35;

      for (const s of flakes) {
        s.y += s.v;
        s.p += s.pSpeed;
        s.twinkle += s.twinkleSpeed;
        s.x += Math.sin(s.p) * 0.5 + s.driftX + wind;

        // Reset if drifted past borders
        if (s.y > h + 10) {
          s.y = -8;
          s.x = Math.random() * w;
        }
        if (s.x > w + 12) {
          s.x = -10;
        } else if (s.x < -12) {
          s.x = w + 10;
        }

        const currentOpacity = Math.min(1, Math.max(0.2, s.op + Math.sin(s.twinkle) * 0.15));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);

        if (s.glow) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(200, 240, 255, 0.9)';
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(235, 248, 255, ${currentOpacity})`;
        }

        ctx.fill();
      }

      ctx.shadowBlur = 0;
      id = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', fit);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] w-full h-full"
    />
  );
}
