"use client";
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
      { label: "Autonomous Dispatch", value: "24/7 Closed-Loop" },
      { label: "Forecast Horizon", value: "168 Hours (7 Days)" },
      { label: "Monitored Stations", value: "Bharati · Maitri · Himadri" }
    ]
  },
  "How it works": {
    eyebrow: "H O W   I T   W O R K S",
    title: "From forecast to dispatch.",
    paragraphs: [
      "Every dispatch decision begins with the atmosphere. Polaris continuously ingests Antarctic and Arctic meteorological telemetry: wind speed vectors, temperatures down to -60°C, solar irradiance, and barometric trends.",
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
      "Through predictive dispatch, Polaris achieves substantial diesel fuel reductions, saving thousands of litres per generator cluster weekly and preventing tons of black carbon soot from settling on polar ice.",
      "Future phases expand telemetry integration to Himadri (Ny-Alesund, Arctic) and automated remote weather stations across Queen Maud Land."
    ],
    stats: [
      { label: "Weekly Carbon Avoided", value: "3.2 Tonnes CO2 / cluster" },
      { label: "Cold Reserve Margin", value: "> 48h emergency autonomy" },
      { label: "Station Coverage", value: "Antarctic & Arctic bases" }
    ]
  }
};

/**
 * Creates authentic aerodynamic wind turbine blade geometry matching real offshore turbines
 * with 3 distinct bold red aviation safety bands, true camber, chord curvature, and twist.
 */
function createAirfoilBladeGeometry(bladeLength: number, segments: number = 44) {
  const baseAirfoil: [number, number][] = [];
  // Upper cambered surface (Leading edge x=0 to Trailing edge x=1)
  for (let i = 0; i <= 12; i++) {
    const x = i / 12;
    const yUpper = 0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x * x * x - 0.1015 * x * x * x * x;
    baseAirfoil.push([x - 0.28, yUpper * 1.3]);
  }
  // Lower pressure surface (Trailing edge x=1 back to Leading edge x=0)
  for (let i = 11; i >= 1; i--) {
    const x = i / 12;
    const yLower = -(0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x * x * x - 0.1015 * x * x * x * x);
    baseAirfoil.push([x - 0.28, yLower * 0.7]);
  }

  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const numPts = baseAirfoil.length;

  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const y = t * bladeLength;

    let chord: number;
    let thickFactor: number;
    let isRootCircle = false;

    if (t < 0.06) {
      isRootCircle = true;
      chord = 0.085;
      thickFactor = 1.0;
    } else if (t < 0.20) {
      const frac = (t - 0.06) / 0.14;
      chord = THREE.MathUtils.lerp(0.085, 0.26, Math.sin((frac * Math.PI) / 2));
      thickFactor = THREE.MathUtils.lerp(1.0, 0.58, frac);
    } else {
      const frac = (t - 0.20) / 0.80;
      chord = THREE.MathUtils.lerp(0.26, 0.042, Math.pow(frac, 0.85));
      thickFactor = THREE.MathUtils.lerp(0.58, 0.20, frac);
    }

    // Aerodynamic wash-out twist
    const twistDeg = THREE.MathUtils.lerp(20, 1.2, Math.pow(t, 0.7));
    const twistRad = (twistDeg * Math.PI) / 180;

    // Graceful aeroelastic blade curvature safely forward away from tower
    const curveZ = Math.pow(t, 1.4) * 0.08;

    // Multi-band red & white aviation safety stripes (matching reference image)
    let r = 0.98, g = 0.99, b = 1.0;
    // Band 1: 0.52 to 0.63
    // Band 2: 0.71 to 0.81
    // Band 3 (Tip): 0.88 to 1.0
    if ((t >= 0.52 && t <= 0.63) || (t >= 0.71 && t <= 0.81) || t >= 0.88) {
      r = 0.92;
      g = 0.16;
      b = 0.16;
    }

    for (let p = 0; p < numPts; p++) {
      let px: number, pz: number;
      if (isRootCircle) {
        const angle = (p / numPts) * Math.PI * 2;
        px = Math.cos(angle) * (chord * 0.5);
        pz = Math.sin(angle) * (chord * 0.5);
      } else {
        const [ax, ay] = baseAirfoil[p];
        const rawX = ax * chord;
        const rawZ = ay * chord * thickFactor;
        px = rawX * Math.cos(twistRad) - rawZ * Math.sin(twistRad);
        pz = rawX * Math.sin(twistRad) + rawZ * Math.cos(twistRad) + curveZ;
      }
      positions.push(px, y, pz);
      colors.push(r, g, b);
      uvs.push(p / numPts, t);
    }
  }

  const indices: number[] = [];
  for (let s = 0; s < segments; s++) {
    for (let p = 0; p < numPts; p++) {
      const nextP = (p + 1) % numPts;
      const a = s * numPts + p;
      const b = (s + 1) * numPts + p;
      const c = (s + 1) * numPts + nextP;
      const d = s * numPts + nextP;
      // Counter-clockwise winding so normals point outwards toward the camera
      indices.push(a, d, b);
      indices.push(d, c, b);
    }
  }

  // Root Cap (s = 0)
  const rootIdx = positions.length / 3;
  positions.push(0, 0, 0);
  colors.push(0.98, 0.99, 1.0);
  uvs.push(0.5, 0.0);
  for (let p = 0; p < numPts; p++) {
    const nextP = (p + 1) % numPts;
    indices.push(rootIdx, nextP, p);
  }

  // Tip Cap (s = segments)
  const tipIdx = positions.length / 3;
  positions.push(0, bladeLength, 0.16);
  colors.push(0.92, 0.16, 0.16);
  uvs.push(0.5, 1.0);
  const lastRingStart = segments * numPts;
  for (let p = 0; p < numPts; p++) {
    const nextP = (p + 1) % numPts;
    indices.push(lastRingStart + p, lastRingStart + nextP, tipIdx);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

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

  // Photorealistic 3D Wind Turbine Canvas (matching reference daylight atmosphere)
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    // Grand cinematic framing
    camera.position.set(0.08, 0.28, 5.4);

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

    // Root Group for the Wind Turbine (Static - does NOT tilt or wobble)
    const turbineRoot = new THREE.Group();
    // 24-degree yaw presents the turbine in crisp 3D perspective matching reference photo
    turbineRoot.rotation.y = 0.42;
    scene.add(turbineRoot);

    // 1. REINFORCED CONCRETE TOWER FOUNDATION (Anchored in the mist)
    const baseGeo = new THREE.CylinderGeometry(0.36, 0.46, 0.26, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xd9e5f3,
      roughness: 0.68,
      metalness: 0.12,
      depthTest: true,
      depthWrite: true
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1.70;
    turbineRoot.add(base);

    // 2. MONOLITHIC TAPERED TUBULAR STEEL TOWER (Clean, tall, stately mast)
    const towerHeight = 2.45;
    const towerGeo = new THREE.CylinderGeometry(0.11, 0.22, towerHeight, 64);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xf4f8fc,
      roughness: 0.22,
      metalness: 0.18,
      depthTest: true,
      depthWrite: true
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = -1.70 + towerHeight / 2 + 0.13; // y = -0.345
    turbineRoot.add(tower);

    // 3. HIGH-TECH STREAMLINED NACELLE WITH FORWARD OVERHANG
    const nacelleY = 0.76;
    const nacelleGroup = new THREE.Group();
    nacelleGroup.position.set(0, nacelleY, 0);
    turbineRoot.add(nacelleGroup);

    // Yaw Ring Collar
    const yawRingGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.05, 48);
    const yawRingMat = new THREE.MeshStandardMaterial({
      color: 0xaec2dc,
      roughness: 0.32,
      metalness: 0.35,
      depthTest: true,
      depthWrite: true
    });
    const yawRing = new THREE.Mesh(yawRingGeo, yawRingMat);
    yawRing.position.y = -0.025;
    nacelleGroup.add(yawRing);

    // Main Nacelle Body (Streamlined capsule extending forward to connect to forward-offset hub)
    const nacelleBodyGeo = new THREE.CylinderGeometry(0.155, 0.185, 1.02, 36);
    const nacelleMat = new THREE.MeshStandardMaterial({
      color: 0xf7fbff,
      roughness: 0.20,
      metalness: 0.25,
      depthTest: true,
      depthWrite: true
    });
    const nacelleBody = new THREE.Mesh(nacelleBodyGeo, nacelleMat);
    nacelleBody.rotation.x = Math.PI / 2;
    nacelleBody.position.set(0, 0.05, 0.10);
    nacelleGroup.add(nacelleBody);

    // Nacelle Rear Aerodynamic Tail
    const nacelleTailGeo = new THREE.ConeGeometry(0.155, 0.36, 36);
    const nacelleTail = new THREE.Mesh(nacelleTailGeo, nacelleMat);
    nacelleTail.rotation.x = -Math.PI / 2;
    nacelleTail.position.set(0, 0.05, -0.60);
    nacelleGroup.add(nacelleTail);

    // Roof Maintenance Walkway & Safety Rails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xbed2e8,
      roughness: 0.3,
      metalness: 0.45,
      depthTest: true,
      depthWrite: true
    });
    const railGeo = new THREE.TorusGeometry(0.09, 0.004, 6, 24, Math.PI);
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.rotation.y = Math.PI / 2;
    rail.position.set(0, 0.23, -0.16);
    nacelleGroup.add(rail);

    // Dual Aviation Red Strobe LED Beacon
    const beaconGeo = new THREE.SphereGeometry(0.032, 16, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xff1e1e,
      emissive: 0xff0000,
      emissiveIntensity: 1.5,
      roughness: 0.15,
      depthTest: true,
      depthWrite: true
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0.24, -0.14);
    nacelleGroup.add(beacon);

    const beaconLight = new THREE.PointLight(0xff2222, 2.2, 4.0);
    beaconLight.position.set(0, 0.27, -0.14);
    nacelleGroup.add(beaconLight);

    // 4. DYNAMIC ROTOR & MULTI-STRIPED AERODYNAMIC WINGS
    // Mounted safely in front of tower with 5-degree aero uptilt and generous clearance
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(0, 0.06, 0.62);
    rotorGroup.rotation.x = -0.087; // 5° aerospace uptilt away from mast
    nacelleGroup.add(rotorGroup);

    // Rotor Spin Subgroup (spins around its tilted shaft axis)
    const rotorSpinner = new THREE.Group();
    rotorGroup.add(rotorSpinner);

    // Aerodynamic Bullet Nose Cone (Spinner Dome)
    const hubGeo = new THREE.ConeGeometry(0.16, 0.34, 40);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.16,
      metalness: 0.20,
      depthTest: true,
      depthWrite: true
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    rotorSpinner.add(hub);

    // 3 Blade Pitch Bearing Rings
    const pitchBearingGeo = new THREE.CylinderGeometry(0.044, 0.050, 0.04, 24);
    const pitchBearingMat = new THREE.MeshStandardMaterial({
      color: 0x9cb4d2,
      roughness: 0.32,
      metalness: 0.40,
      depthTest: true,
      depthWrite: true
    });

    const bladeGeo = createAirfoilBladeGeometry(1.52, 44);
    const bladeMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.22,
      metalness: 0.12,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true
    });

    const createBladeAssembly = (angle: number) => {
      const bladeHolder = new THREE.Group();
      bladeHolder.rotation.z = angle;

      const pitchBearing = new THREE.Mesh(pitchBearingGeo, pitchBearingMat);
      pitchBearing.position.y = 0.05;
      bladeHolder.add(pitchBearing);

      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.position.y = 0.07;
      bladeHolder.add(bladeMesh);

      return bladeHolder;
    };

    const blade1 = createBladeAssembly(0);
    const blade2 = createBladeAssembly((2 * Math.PI) / 3);
    const blade3 = createBladeAssembly((4 * Math.PI) / 3);
    rotorSpinner.add(blade1);
    rotorSpinner.add(blade2);
    rotorSpinner.add(blade3);

    // 5. PHOTOREALISTIC DAYLIGHT LIGHTING (matching reference sunny sky photo)
    const ambientLight = new THREE.AmbientLight(0xafcff8, 0.95);
    scene.add(ambientLight);

    // Strong Sun Key Light from top-left
    const sunLight = new THREE.DirectionalLight(0xfffbf0, 2.7);
    sunLight.position.set(-4.5, 6.0, 5.5);
    scene.add(sunLight);

    // Sky Fill Light from top-right
    const skyFillLight = new THREE.DirectionalLight(0x84b2f5, 1.3);
    skyFillLight.position.set(4.0, 3.5, 2.5);
    scene.add(skyFillLight);

    // Upward Cloud/Mist Glint Bounce Light from below
    const cloudBounceLight = new THREE.DirectionalLight(0xffffff, 1.2);
    cloudBounceLight.position.set(0, -4.5, 2.5);
    scene.add(cloudBounceLight);

    // 6. DYNAMIC WINGS INTERACTION
    let spinVelocity = 0;
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
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        const delta = dx - dy;
        spinVelocity += delta * 0.0028;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);

    // 7. ANIMATION LOOP
    let clock = 0;
    const baseSpinSpeed = 0.018;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      clock += 0.016;

      // Dynamic wings rotation
      if (isRotatingRef.current) {
        const targetSpeed = baseSpinSpeed + spinVelocity;
        rotorSpinner.rotation.z -= targetSpeed;
        spinVelocity *= 0.94; // Smooth momentum inertia decay
      } else if (Math.abs(spinVelocity) > 0.0001) {
        rotorSpinner.rotation.z -= spinVelocity;
        spinVelocity *= 0.92;
      }

      // Strobe beacon flash
      const pulse = Math.sin(clock * 4.8);
      const isStrobe = pulse > 0.78;
      beaconMat.emissiveIntensity = isStrobe ? 2.8 : 0.2;
      beaconLight.intensity = isStrobe ? 2.6 : 0.1;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      bladeGeo.dispose();
      renderer.dispose();
    };
  }, []);

  const toggleRotation = useCallback(() => {
    isRotatingRef.current = !isRotatingRef.current;
    setIsRotating(isRotatingRef.current);
  }, []);

  return (
    <div className="polaris-hero relative min-h-[92vh] flex flex-col justify-between" aria-label="Polaris home">
      {/* HEADER NAVIGATION - Upper Panel with Pop-up Modals for each item */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-10 py-5 max-w-7xl mx-auto w-full">
        <a href="/" className="flex items-center gap-2.5 select-none group">
          <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center bg-white/10 backdrop-blur-md group-hover:border-white transition-colors shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="2.5" fill="#60cfff" />
              <line x1="12" y1="2" x2="12" y2="6" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="2" y1="12" x2="6" y2="12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="18" y1="12" x2="22" y2="12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-bold text-base tracking-wider drop-shadow-sm uppercase">
            POLARIS<span className="text-[#bfdbfe] font-normal text-xs ml-1.5 normal-case tracking-normal">polar energy AI</span>
          </span>
        </a>

        {/* Upper Panel Nav - Each item triggers its own pop-up */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveModal(item)}
              className={`text-sm font-medium transition-all cursor-pointer py-1.5 px-3 rounded-lg ${
                activeModal === item
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Sign in Button */}
        <a
          href="/signup"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-[#0f244c]/90 hover:bg-[#16356e] text-white border border-white/25 hover:border-white/50 transition-all shadow-md backdrop-blur-md"
        >
          Sign In
        </a>
      </header>

      {/* HERO CONTENT & GRAND 3D WIND TURBINE */}
      <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between flex-1 px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full gap-8">
        {/* Left Column: Bold, High-Impact Clean Typography matching reference */}
        <div className="flex-1 max-w-xl space-y-6 text-white pt-4 sm:pt-8">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.08] tracking-tight drop-shadow-md">
            Powering the <br />
            Future of AI with <br />
            <span className="text-[#ffffff]">Clean Energy</span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 font-normal leading-relaxed max-w-md drop-shadow-sm">
            Predictive load forecasting and hybrid dispatch that cuts diesel fuel consumption across polar research stations.
          </p>

          {/* CTAs matching reference pill buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold bg-white text-[#0a1b3f] hover:bg-[#f0f4fc] transition-all shadow-lg text-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Microgrid
            </a>

            <button
              type="button"
              onClick={() => setActiveModal("Overview")}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full font-medium bg-[#1d3568]/60 hover:bg-[#1d3568]/85 text-white border border-white/20 hover:border-white/40 transition-all text-sm backdrop-blur-md cursor-pointer shadow-md"
            >
              Station Telemetry
            </button>
          </div>
        </div>

        {/* Right Column: Grand Photorealistic 3D Wind Turbine Canvas */}
        <div className="relative flex-1 flex items-center justify-center w-full max-w-[560px] lg:max-w-[640px] h-[480px] sm:h-[540px] lg:h-[620px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ touchAction: "none" }}
            title="Drag to spin wings dynamically"
          />

          {/* Pause / Play Dynamic Wings Rotation Button */}
          <button
            type="button"
            onClick={toggleRotation}
            id="polaris-turbine-toggle"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/35 transition-all text-xs shadow-md cursor-pointer"
            title={isRotating ? "Pause wings rotation" : "Resume wings rotation"}
          >
            {isRotating ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 4 20 12 6 20" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* POPUP MODAL ACCESSIBLE FOR EACH PANEL ITEM */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/30 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#0e2a5a]/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 shadow-[0_24px_64px_-10px_rgba(2,12,32,0.45)] text-white animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white/90 hover:text-white transition-colors text-sm cursor-pointer shadow-sm"
              aria-label="Close dialog"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Modal Eyebrow */}
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase mb-1.5">
              {MODAL_CONTENT[activeModal].eyebrow}
            </p>

            {/* Modal Title */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4 leading-snug drop-shadow-sm">
              {MODAL_CONTENT[activeModal].title}
            </h2>

            {/* Modal Paragraphs */}
            <div className="space-y-3.5 text-sm sm:text-base text-blue-100/90 leading-relaxed">
              {MODAL_CONTENT[activeModal].paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Modal Key Specs / Metrics */}
            <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MODAL_CONTENT[activeModal].stats.map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center sm:text-left shadow-sm">
                  <p className="text-[11px] text-sky-200 uppercase tracking-wider font-medium">{stat.label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-3 items-center">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
              <a
                href="/signup"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-200 hover:from-sky-300 hover:via-cyan-200 hover:to-white text-[#061838] transition-all shadow-md hover:shadow-cyan-400/35"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
