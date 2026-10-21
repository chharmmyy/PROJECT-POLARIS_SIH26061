const fs = require('fs');

const code = `"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

const NAV_ITEMS = ["Overview", "How it works", "Technology", "Impact"] as const;
type NavItem = (typeof NAV_ITEMS)[number];

const MODAL_CONTENT: Record<
  NavItem,
  {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    stats: { label: string; value: string }[];
  }
> = {
  Overview: {
    eyebrow: "O V E R V I E W",
    title: "AI energy autonomy for polar extremes.",
    paragraphs: [
      "Operating research stations in Antarctica and the High Arctic demands immense fuel reserves transported under hazardous sea-ice conditions. Every litre of diesel saved preserves mission autonomy and safeguards fragile polar environments.",
      "Polaris delivers continuous, closed-loop microgrid optimization across Bharati, Maitri, and Himadri. By harmonizing wind generation, solar arrays, battery storage, and diesel units, the platform cuts fuel burn while strictly maintaining life-support power reliability.",
      "With automated 168-hour predictive dispatch, station leads can schedule energy-intensive scientific instruments and thermal heating cycles around peak renewable output."
    ],
    stats: [
      { label: "Documented Fuel Saved", value: "3.49%" },
      { label: "Forecast Horizon", value: "168 Hours (7 Days)" },
      { label: "Monitored Stations", value: "Bharati ? Maitri ? Himadri" }
    ]
  },
  "How it works": {
    eyebrow: "H O W   I T   W O R K S",
    title: "From forecast to dispatch.",
    paragraphs: [
      "Every dispatch decision begins with the atmosphere. Polaris continuously ingests Antarctic and Arctic meteorological telemetry: wind speed vectors, temperatures down to -60?C, solar irradiance, and barometric trends.",
      "Our Random Forest engine translates weather forecasts into hyper-localized station load predictions. Simultaneously, the Grey Wolf Optimizer calculates optimal hourly dispatch: deploying battery reserves first, locking diesel generators in their peak efficiency window (75-85% loading), and cutting idle run time.",
      "Isolation Forest anomaly detectors scan inverter harmonics, battery cell temperatures, and heating sub-panels to flag irregular energy signatures before emergency generators are triggered."
    ],
    stats: [
      { label: "Dispatch Engine", value: "Grey Wolf Optimization (GWO)" },
      { label: "Forecasting Model", value: "Random Forest Regressor" },
      { label: "Anomaly Detection", value: "Isolation Forest (2% threshold)" }
    ]
  },
  Technology: {
    eyebrow: "T E C H N O L O G Y",
    title: "Proven models engineered for sub-zero resilience.",
    paragraphs: [
      "Polar microgrids cannot afford model drift or unexplainable black-box decisions. Polaris uses transfer-validated ML architectures trained on Bharati station telemetry and validated against Maitri.",
      "Battery-first heuristic dispatch ensures generator run-time is consolidated into high-efficiency windows, eliminating engine wet-stacking and reducing servicing cycles by up to 18%.",
      "All models are exposed via high-performance REST APIs designed for low-bandwidth satellite uplinks (Iridium / Starlink Polar) with seamless local edge offline fallback."
    ],
    stats: [
      { label: "Generator Loading Band", value: "75% - 85% optimal" },
      { label: "Battery Chemistry", value: "Cold-rated LiFePO4 Thermal Pack" },
      { label: "Telemetry Latency", value: "< 250ms local edge inference" }
    ]
  },
  Impact: {
    eyebrow: "I M P A C T",
    title: "Less diesel. Longer autonomy. Cleaner polar science.",
    paragraphs: [
      "In polar research, energy logistics dictate scientific capability. Every supply ship traversing the Southern Ocean burns heavy fuel and faces severe sea-ice blockades. Extending station autonomy through renewable microgrids directly expands science operational windows.",
      "In our 7-day validation run, Polaris achieved a 3.49% direct diesel reduction, saving thousands of litres per generator cluster weekly and preventing tons of black carbon soot from settling on polar ice.",
      "Future phases expand telemetry integration to Himadri (Ny-Alesund, Arctic) and automated remote weather stations across Queen Maud Land."
    ],
    stats: [
      { label: "Weekly Carbon Avoided", value: "3.2 Tonnes CO2 / cluster" },
      { label: "Cold Reserve Margin", value: "> 48h emergency autonomy" },
      { label: "Station Coverage", value: "Antarctic & Arctic bases" }
    ]
  }
};

export default function PolarisHero({ theme }: { theme?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeModal, setActiveModal] = useState<NavItem | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const isRotatingRef = useRef(true);
  const rafRef = useRef<number>(0);

  // Close modal on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModal(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // 3D Wind Turbine Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.5, 5.0);

    const onResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    onResize();
    window.addEventListener("resize", onResize);

    // Group for whole turbine (for subtle mouse parallax and drag)
    const turbineGroup = new THREE.Group();
    turbineGroup.position.set(0.1, -1.35, 0);
    scene.add(turbineGroup);

    // 1. TOWER (Realistic tapered tubular steel pole)
    const towerGeo = new THREE.CylinderGeometry(0.11, 0.26, 3.8, 36);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xecf2fa,
      roughness: 0.32,
      metalness: 0.28
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 1.9;
    turbineGroup.add(tower);

    // Structural flange weld rings
    for (const h of [0.6, 1.5, 2.5, 3.5]) {
      const ringRadius = 0.11 + (0.26 - 0.11) * ((3.8 - h) / 3.8);
      const ringGeo = new THREE.TorusGeometry(ringRadius, 0.012, 8, 36);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.4,
        metalness: 0.4
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = h;
      turbineGroup.add(ring);
    }

    // Foundation Base Platform (Snow-covered concrete footing)
    const baseGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.22, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xc9d7eb,
      roughness: 0.65,
      metalness: 0.1
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.11;
    turbineGroup.add(base);

    // 2. NACELLE (Aerodynamic generator housing on top)
    const nacelleGroup = new THREE.Group();
    nacelleGroup.position.set(0, 3.8, 0);
    turbineGroup.add(nacelleGroup);

    const nacelleBodyGeo = new THREE.CylinderGeometry(0.18, 0.21, 0.85, 28);
    const nacelleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.3
    });
    const nacelleBody = new THREE.Mesh(nacelleBodyGeo, nacelleMat);
    nacelleBody.rotation.x = Math.PI / 2;
    nacelleBody.position.set(0, 0.06, -0.15);
    nacelleGroup.add(nacelleBody);

    // Nacelle rear taper cap
    const nacelleTailGeo = new THREE.ConeGeometry(0.18, 0.35, 28);
    const nacelleTail = new THREE.Mesh(nacelleTailGeo, nacelleMat);
    nacelleTail.rotation.x = -Math.PI / 2;
    nacelleTail.position.set(0, 0.06, -0.72);
    nacelleGroup.add(nacelleTail);

    // Aviation Red Strobe Beacon at top of nacelle
    const beaconGeo = new THREE.SphereGeometry(0.042, 16, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xff1e1e,
      emissive: 0xff0000,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0.29, -0.3);
    nacelleGroup.add(beacon);

    const beaconLight = new THREE.PointLight(0xff2222, 2.0, 3.5);
    beaconLight.position.set(0, 0.32, -0.3);
    nacelleGroup.add(beaconLight);

    // 3. ROTOR & 3 BLADES
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(0, 0.06, 0.32);
    nacelleGroup.add(rotorGroup);

    // Aerodynamic Nose Cone (Hub)
    const hubGeo = new THREE.ConeGeometry(0.17, 0.36, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.2
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    rotorGroup.add(hub);

    // Function to create a realistic curved aerodynamic blade
    const createBlade = (angle: number) => {
      const bladeHolder = new THREE.Group();
      bladeHolder.rotation.z = angle;

      // Blade root shank
      const rootGeo = new THREE.CylinderGeometry(0.035, 0.042, 0.22, 16);
      const rootMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.4,
        metalness: 0.3
      });
      const root = new THREE.Mesh(rootGeo, rootMat);
      root.position.y = 0.12;
      bladeHolder.add(root);

      // Main aerodynamic airfoil blade body
      const bladeLength = 2.45;
      const mainBladeGeo = new THREE.CylinderGeometry(0.015, 0.085, bladeLength, 18);
      mainBladeGeo.scale(0.3, 1, 1); // Flatten into aerodynamic airfoil profile

      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xfcfdfd,
        roughness: 0.26,
        metalness: 0.15
      });
      const blade = new THREE.Mesh(mainBladeGeo, bladeMat);
      blade.position.y = 0.22 + bladeLength / 2;
      blade.rotation.y = 0.18; // Aerodynamic angle of attack twist
      bladeHolder.add(blade);

      // Red Aviation Warning Tip (Arctic standard high-visibility mark)
      const tipGeo = new THREE.CylinderGeometry(0.014, 0.028, 0.38, 18);
      tipGeo.scale(0.3, 1, 1);
      const tipMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.3,
        metalness: 0.1
      });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.y = 0.22 + bladeLength - 0.19;
      tip.rotation.y = 0.18;
      bladeHolder.add(tip);

      return bladeHolder;
    };

    // Add 3 blades spaced 120 deg apart
    const blade1 = createBlade(0);
    const blade2 = createBlade((2 * Math.PI) / 3);
    const blade3 = createBlade((4 * Math.PI) / 3);
    rotorGroup.add(blade1);
    rotorGroup.add(blade2);
    rotorGroup.add(blade3);

    // 4. LIGHTING FOR POLAR AMBIANCE
    const ambientLight = new THREE.AmbientLight(0x7ea7eb, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(4, 3, 5);
    scene.add(sunLight);

    const bounceLight = new THREE.DirectionalLight(0xa5c4f5, 0.85);
    bounceLight.position.set(-3, -2, -2);
    scene.add(bounceLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
    rimLight.position.set(-4, 4, -2);
    scene.add(rimLight);

    // 5. INTERACTION & MOUSE PARALLAX
    let targetRotY = -0.32;
    let targetRotX = 0.04;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onPointerUp = () => {
      isDragging = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = (e.clientX - prevMouseX) * 0.006;
        const dy = (e.clientY - prevMouseY) * 0.004;
        targetRotY += dx;
        targetRotX = Math.max(-0.25, Math.min(0.25, targetRotX + dy));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        const rect = canvas.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotY = -0.32 + nx * 0.25;
        targetRotX = 0.04 - ny * 0.15;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);

    // 6. ANIMATION LOOP
    let clock = 0;
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      clock += 0.016;

      // Rotate turbine rotor smoothly
      if (isRotatingRef.current) {
        rotorGroup.rotation.z -= 0.018; // Graceful, realistic turbine rotational speed
      }

      // Smooth dampening towards target rotation
      turbineGroup.rotation.y += (targetRotY - turbineGroup.rotation.y) * 0.05;
      turbineGroup.rotation.x += (targetRotX - turbineGroup.rotation.x) * 0.05;

      // Strobe beacon light every 1.4 seconds
      const pulse = Math.sin(clock * 4.5);
      const isStrobe = pulse > 0.75;
      beaconMat.emissiveIntensity = isStrobe ? 2.5 : 0.2;
      beaconLight.intensity = isStrobe ? 2.8 : 0.1;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      renderer.dispose();
    };
  }, []);

  const toggleRotation = useCallback(() => {
    isRotatingRef.current = !isRotatingRef.current;
    setIsRotating(isRotatingRef.current);
  }, []);

  return (
    <div className="polaris-hero relative min-h-[92vh] flex flex-col justify-between" aria-label="Polaris home">
      {/* HEADER NAVIGATION */}
      <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5 max-w-7xl mx-auto w-full">
        <a href="/" className="flex items-center gap-2.5 select-none group">
          <div className="w-8 h-8 rounded-full border border-[#60cfff]/60 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:border-[#60cfff] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="#60cfff" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="2.5" fill="#60cfff" />
              <line x1="12" y1="2" x2="12" y2="6" stroke="#60cfff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="#60cfff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="2" y1="12" x2="6" y2="12" stroke="#60cfff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="18" y1="12" x2="22" y2="12" stroke="#60cfff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-medium text-base tracking-tight">
            polaris<span className="text-[#8eb0f5] font-normal text-xs ml-1.5">polar energy AI</span>
          </span>
        </a>

        {/* Modal-trigger Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((n) => (
            <button
              key={n}
              onClick={() => setActiveModal(n)}
              className="text-sm text-[#cbdcf8] hover:text-white transition-colors cursor-pointer font-medium py-1 px-2 rounded hover:bg-white/5"
            >
              {n}
            </button>
          ))}
        </nav>

        {/* Sign up Button */}
        <a
          href="/signup"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-[#1d3266]/80 hover:bg-[#274288] text-white border border-white/20 hover:border-white/40 transition-all shadow-sm backdrop-blur-sm"
        >
          Sign up
        </a>
      </header>

      {/* HERO CONTENT & 3D WIND TURBINE */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1 px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full gap-8">
        {/* Left Column: Refined Typography & CTAs */}
        <div className="flex-1 max-w-xl space-y-5 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-semibold tracking-[0.16em] uppercase text-[#a5c2f8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#60cfff] animate-pulse" />
            Antarctic ? Arctic ? Clean Energy
          </div>

          {/* Refined smaller headline scale */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.16] tracking-tight">
            Powering polar <br />
            research with <br />
            <span className="text-[#60cfff] font-extrabold">clean energy.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#c4d6f3] leading-relaxed max-w-md">
            Predictive load forecasting and hybrid dispatch that cuts diesel fuel consumption across Bharati, Maitri, and Himadri research stations.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-white text-[#0a1a3e] hover:bg-[#ebf2ff] transition-all shadow-md text-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              Get early access
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <button
              onClick={() => setActiveModal("How it works")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium border border-white/25 text-white hover:bg-white/10 transition-all text-sm backdrop-blur-sm cursor-pointer"
            >
              See how it works
            </button>
          </div>

          <div className="flex items-center gap-3 pt-3 text-xs text-[#8ea8d6]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34d399]" />
            <span>Trained on Bharati ? Validated on Maitri ? 168-Hour Horizon</span>
          </div>
        </div>

        {/* Right Column: Majestic 3D Wind Turbine Canvas */}
        <div className="relative flex-1 flex items-center justify-center w-full max-w-[480px] lg:max-w-[560px] h-[400px] sm:h-[460px] lg:h-[500px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing rounded-2xl"
            style={{ touchAction: "none" }}
            title="Drag to orbit wind turbine"
          />

          {/* Pause / Play Turbine Rotation Button */}
          <button
            onClick={toggleRotation}
            id="polaris-turbine-toggle"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-all text-xs shadow-sm cursor-pointer"
            title={isRotating ? "Pause turbine rotation" : "Resume turbine rotation"}
          >
            {isRotating ? "?" : "?"}
          </button>

          {/* Subtle caption */}
          <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
            <p className="text-[11px] text-[#8ea8d6]/80 tracking-wide">
              Polar wind turbine ? Drag to rotate perspective
            </p>
          </div>
        </div>
      </div>

      {/* POPUP MODAL (Overview, How it works, Technology, Impact) */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#0c1836]/95 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-white max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors text-sm cursor-pointer"
              aria-label="Close dialog"
            >
              ?
            </button>

            {/* Modal Category Tabs */}
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/10 overflow-x-auto">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveModal(item)}
                  className={\`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer \${
                    activeModal === item
                      ? "bg-[#25458f] text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }\`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Modal Eyebrow */}
            <p className="text-xs font-semibold tracking-[0.2em] text-[#60cfff] uppercase mb-1.5">
              {MODAL_CONTENT[activeModal].eyebrow}
            </p>

            {/* Modal Title */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4 leading-snug">
              {MODAL_CONTENT[activeModal].title}
            </h2>

            {/* Modal Paragraphs */}
            <div className="space-y-3.5 text-sm sm:text-base text-slate-300 leading-relaxed">
              {MODAL_CONTENT[activeModal].paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Modal Key Specs / Metrics */}
            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MODAL_CONTENT[activeModal].stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center sm:text-left">
                  <p className="text-[11px] text-[#8ea8d6] uppercase tracking-wider font-medium">{stat.label}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Modal CTA */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
              <a
                href="/signup"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#60cfff] text-[#071335] hover:bg-[#85daff] transition-all"
              >
                Get early access
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('components/polaris/polaris-hero.tsx', code, 'utf8');
console.log('Saved components/polaris/polaris-hero.tsx without BOM');
