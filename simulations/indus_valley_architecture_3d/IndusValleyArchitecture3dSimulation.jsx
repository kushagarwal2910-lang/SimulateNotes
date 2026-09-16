import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';

export default function IndusValleyArchitecture3dSimulation() {
  const [view_mode, setViewMode] = useState('great_bath_cutaway');
  const [water_fill_level_m, setWaterFillLevel] = useState(1.8);
  const [exploded_cutaway_pct, setExplodedCutawayPct] = useState(25);
  const [drainage_slope_deg, setDrainageSlopeDeg] = useState(1.2);
  const [ambient_outside_temp_c, setAmbientOutsideTemp] = useState(44);
  const [sun_angle_deg, setSunAngleDeg] = useState(60);
  const [bitumen_layer_visible, setBitumenLayerVisible] = useState(true);
  const [sewage_flow_active, setSewageFlowActive] = useState(true);

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const groupsRef = useRef({});
  const waterMeshRef = useRef(null);
  const sunLightRef = useRef(null);

  const courtyard_interior_temp_c = ambient_outside_temp_c - 12.5;
  const thermal_cooling_delta_c = 12.5;
  const bitumen_seal_impermeability_pct = 99.6;
  const sewage_evacuation_velocity_mps = Math.sqrt(2 * 9.81 * Math.sin((drainage_slope_deg * Math.PI) / 180) * 0.35);
  const acoustic_noise_attenuation_db = 38;
  const granary_air_draft_velocity_mps = 1.4;
  const brick_ratio_str = '1 : 2 : 4 (7cm x 14cm x 28cm)';

  const telemetryMetrics = [
    { id: 'brick_ratio', label: 'Standard Brick Metric', unit: 'Ratio', value: brick_ratio_str },
    { id: 'water_depth', label: 'Bath Water Depth', unit: 'm', value: water_fill_level_m.toFixed(1) },
    { id: 'bitumen_seal', label: 'Bitumen Impermeability', unit: '%', value: bitumen_seal_impermeability_pct.toFixed(1) },
    { id: 'courtyard_temp', label: 'Courtyard Interior Temp', unit: '°C', value: courtyard_interior_temp_c.toFixed(1) },
    { id: 'sewer_velocity', label: 'Sewer Drainage Flow', unit: 'm/s', value: sewage_evacuation_velocity_mps.toFixed(2) },
    { id: 'acoustic_isolation', label: 'Acoustic Wall Isolation', unit: 'dB', value: acoustic_noise_attenuation_db }
  ];

  const educationalCards = [
    {
      title: 'The Standardized 1:2:4 Brick Ratio',
      content: 'Across thousands of square kilometers in the Indus basin, every excavated city used bricks with identical height-to-width-to-length proportions of 1:2:4 (standard size 7 x 14 x 28 cm). This universal modular ratio allowed uniform structural bonding, load distribution, and modular corbelling without cutting bricks.'
    },
    {
      title: 'The Great Bath & Natural Bitumen Waterproofing',
      content: 'Built in the Citadel of Mohenjo-daro circa 2500 BCE, the Great Bath is the oldest public water tank known to history. To prevent seepage, Harappan engineers layered baked bricks bonded with gypsum mortar, followed by a thick continuous sandwich layer of natural bitumen (asphalt pitch), completely sealing the 160-cubic-meter tank.'
    },
    {
      title: 'Advanced Covered Underground Drainage',
      content: 'Centuries before Rome, Indus cities possessed complete underground sewer networks. Brick-lined channels ran beneath every street with a precise 1:50 gravity fall gradient. Silt soak pits collected solids, while removable terracotta and limestone inspection covers permitted routine civil maintenance.'
    },
    {
      title: 'Passive Courtyard Cooling & Acoustic Privacy',
      content: 'Indus residences were designed for harsh desert climates. Houses faced inward toward a private central open courtyard that created a natural convective stack effect. Exterior walls had zero street-level windows, creating a 12°C cooler microclimate and attenuating 38 dB of street noise and dust.'
    }
  ];

  // Initialize Three.js WebGL Scene ONCE
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 900;
    const height = 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 12, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 60;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.55);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    sunLight.position.set(15, 20, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const blueHemisphere = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 0.4);
    scene.add(blueHemisphere);

    // Ground Citadel Platform
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Materials Palette
    const brickMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85, metalness: 0.05 });
    const darkBrickMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const bitumenMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.4 });
    const gypsumMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.6 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 });
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.33
    });

    // -------------------------------------------------------------
    // 1. Great Bath Group
    // -------------------------------------------------------------
    const bathGroup = new THREE.Group();
    bathGroup.name = 'great_bath_cutaway';

    // Sunken Pool Outer Dimensions (12m x 7m x 2.4m)
    const poolFloor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 7), brickMat);
    poolFloor.position.set(0, 0.2, 0);
    poolFloor.receiveShadow = true;
    bathGroup.add(poolFloor);

    // Bitumen waterproofing sandwich layer
    const bitumenFloor = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.15, 6.8), bitumenMat);
    bitumenFloor.position.set(0, 0.45, 0);
    bitumenFloor.name = 'bitumen_layer';
    bathGroup.add(bitumenFloor);

    // Inner Gypsum finished floor
    const innerFloor = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.1, 6.6), gypsumMat);
    innerFloor.position.set(0, 0.55, 0);
    innerFloor.receiveShadow = true;
    bathGroup.add(innerFloor);

    // Brick Wall Courses
    const wallHeight = 2.4;
    const nWall = new THREE.Mesh(new THREE.BoxGeometry(12.8, wallHeight, 0.6), brickMat);
    nWall.position.set(0, wallHeight / 2 + 0.2, -3.8);
    nWall.castShadow = true;
    bathGroup.add(nWall);

    const sWall = new THREE.Mesh(new THREE.BoxGeometry(12.8, wallHeight, 0.6), brickMat);
    sWall.position.set(0, wallHeight / 2 + 0.2, 3.8);
    sWall.castShadow = true;
    bathGroup.add(sWall);

    const eWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, wallHeight, 7.6), brickMat);
    eWall.position.set(6.4, wallHeight / 2 + 0.2, 0);
    eWall.castShadow = true;
    bathGroup.add(eWall);

    const wWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, wallHeight, 7.6), brickMat);
    wWall.position.set(-6.4, wallHeight / 2 + 0.2, 0);
    wWall.castShadow = true;
    bathGroup.add(wWall);

    // Bitumen Wall Linings (Internal sandwich)
    const nBitumen = new THREE.Mesh(new THREE.BoxGeometry(12, wallHeight - 0.2, 0.1), bitumenMat);
    nBitumen.position.set(0, wallHeight / 2 + 0.2, -3.45);
    nBitumen.name = 'bitumen_layer';
    bathGroup.add(nBitumen);

    const sBitumen = new THREE.Mesh(new THREE.BoxGeometry(12, wallHeight - 0.2, 0.1), bitumenMat);
    sBitumen.position.set(0, wallHeight / 2 + 0.2, 3.45);
    sBitumen.name = 'bitumen_layer';
    bathGroup.add(sBitumen);

    // North and South Stepped Staircases leading down into water
    for (let step = 0; step < 6; step++) {
      const stepWidth = 2.8;
      const stepHeight = 0.35;
      const stepDepth = 0.55;

      const nStep = new THREE.Mesh(new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth), brickMat);
      nStep.position.set(0, 0.4 + (5 - step) * 0.35, -3.2 + step * 0.5);
      nStep.castShadow = true;
      bathGroup.add(nStep);

      const sStep = new THREE.Mesh(new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth), brickMat);
      sStep.position.set(0, 0.4 + (5 - step) * 0.35, 3.2 - step * 0.5);
      sStep.castShadow = true;
      bathGroup.add(sStep);
    }

    // Colonnade (Pillared Verandah around Great Bath)
    for (let col = -5; col <= 5; col += 2.5) {
      const colN = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.2, 12), darkBrickMat);
      colN.position.set(col, 1.8, -5.2);
      colN.castShadow = true;
      bathGroup.add(colN);

      const colS = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.2, 12), darkBrickMat);
      colS.position.set(col, 1.8, 5.2);
      colS.castShadow = true;
      bathGroup.add(colS);
    }

    // Dynamic Pool Water Mesh
    const waterGeo = new THREE.BoxGeometry(11.4, 0.2, 6.4);
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, 0.6 + water_fill_level_m, 0);
    bathGroup.add(waterMesh);
    waterMeshRef.current = waterMesh;

    scene.add(bathGroup);
    groupsRef.current['great_bath_cutaway'] = bathGroup;

    // -------------------------------------------------------------
    // 2. Underground Corbelled Sewer Network Group
    // -------------------------------------------------------------
    const sewerGroup = new THREE.Group();
    sewerGroup.name = 'underground_drainage';

    // Street Pavement Slab with cross-section cutaway
    const streetPavement = new THREE.Mesh(new THREE.BoxGeometry(16, 0.3, 8), darkBrickMat);
    streetPavement.position.set(0, 3.2, 0);
    streetPavement.receiveShadow = true;
    sewerGroup.add(streetPavement);

    // Corbelled vaulted main drain trench (trapezoidal arch)
    const drainFloor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 1.8), brickMat);
    drainFloor.position.set(0, 0.4, 0);
    sewerGroup.add(drainFloor);

    // Stepped corbelled brick sidewalls
    for (let layer = 0; layer < 5; layer++) {
      const inset = layer * 0.12;
      const leftSlab = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, 0.6), brickMat);
      leftSlab.position.set(0, 0.8 + layer * 0.4, -0.9 + inset);
      sewerGroup.add(leftSlab);

      const rightSlab = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, 0.6), brickMat);
      rightSlab.position.set(0, 0.8 + layer * 0.4, 0.9 - inset);
      sewerGroup.add(rightSlab);
    }

    // Removable limestone inspection covers
    for (let c = -6; c <= 6; c += 3) {
      const cover = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.4), gypsumMat);
      cover.position.set(c, 2.9, 0);
      sewerGroup.add(cover);

      // Silt soak pit underneath
      const pit = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 1.2, 16), darkBrickMat);
      pit.position.set(c, -0.2, 0);
      sewerGroup.add(pit);
    }

    // Sewage stream inside drain
    const sewageStream = new THREE.Mesh(new THREE.BoxGeometry(16, 0.15, 0.9), waterMat);
    sewageStream.position.set(0, 0.65, 0);
    sewerGroup.add(sewageStream);

    scene.add(sewerGroup);
    groupsRef.current['underground_drainage'] = sewerGroup;

    // -------------------------------------------------------------
    // 3. Domestic Courtyard House Group
    // -------------------------------------------------------------
    const houseGroup = new THREE.Group();
    houseGroup.name = 'courtyard_house';

    // 2-Story Exterior Perimeter Walls (Unwindowed for desert insulation & dust)
    const houseW = 14;
    const houseD = 12;
    const houseH = 6;

    const extNorth = new THREE.Mesh(new THREE.BoxGeometry(houseW, houseH, 0.8), brickMat);
    extNorth.position.set(0, houseH / 2, -houseD / 2);
    houseGroup.add(extNorth);

    const extSouth = new THREE.Mesh(new THREE.BoxGeometry(houseW, houseH, 0.8), brickMat);
    extSouth.position.set(0, houseH / 2, houseD / 2);
    houseGroup.add(extSouth);

    const extEast = new THREE.Mesh(new THREE.BoxGeometry(0.8, houseH, houseD), brickMat);
    extEast.position.set(houseW / 2, houseH / 2, 0);
    houseGroup.add(extEast);

    const extWest = new THREE.Mesh(new THREE.BoxGeometry(0.8, houseH, houseD), brickMat);
    extWest.position.set(-houseW / 2, houseH / 2, 0);
    houseGroup.add(extWest);

    // Central Open-Air Cooling Courtyard Floor
    const courtFloor = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 5), gypsumMat);
    courtFloor.position.set(0, 0.1, 0);
    houseGroup.add(courtFloor);

    // Second Floor Timber Balcony / Gallery
    const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(houseW - 1.6, 0.25, houseD - 1.6), woodMat);
    balconyFloor.position.set(0, 3.2, 0);
    houseGroup.add(balconyFloor);

    // Domestic Bathroom terracotta drainage chute
    const chute = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.5, 12), brickMat);
    chute.position.set(houseW / 2 - 1.2, 1.8, houseD / 2 - 1.5);
    chute.rotation.z = 0.15;
    houseGroup.add(chute);

    scene.add(houseGroup);
    groupsRef.current['courtyard_house'] = houseGroup;

    // -------------------------------------------------------------
    // 4. Granary Ventilation Ducts Group
    // -------------------------------------------------------------
    const granaryGroup = new THREE.Group();
    granaryGroup.name = 'granary_ventilation';

    // Massive elevated brick podium base
    const podium = new THREE.Mesh(new THREE.BoxGeometry(16, 1.4, 10), brickMat);
    podium.position.set(0, 0.7, 0);
    podium.receiveShadow = true;
    granaryGroup.add(podium);

    // Hollow subterranean sleeper walls forming criss-crossing air trenches
    for (let tr = -6; tr <= 6; tr += 2.4) {
      const sleeperWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 10), darkBrickMat);
      sleeperWall.position.set(tr, 2.0, 0);
      sleeperWall.castShadow = true;
      granaryGroup.add(sleeperWall);
    }

    // Timber granary floor with gaps for convection
    const timberDeck = new THREE.Mesh(new THREE.BoxGeometry(16, 0.3, 10), woodMat);
    timberDeck.position.set(0, 2.7, 0);
    granaryGroup.add(timberDeck);

    scene.add(granaryGroup);
    groupsRef.current['granary_ventilation'] = granaryGroup;

    // Continuous Render Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle water wave ripple
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = 0.6 + water_fill_level_m + Math.sin(elapsed * 2) * 0.03;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 900;
      const h = 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update dynamic properties when state changes (WITHOUT rebuilding scene)
  useEffect(() => {
    // 1. Toggle visibility based on view_mode
    Object.keys(groupsRef.current).forEach((key) => {
      const grp = groupsRef.current[key];
      if (grp) {
        grp.visible = (key === view_mode);
      }
    });

    // 2. Adjust camera target and position for selected mode
    if (controlsRef.current && cameraRef.current) {
      if (view_mode === 'great_bath_cutaway') {
        controlsRef.current.target.set(0, 1.5, 0);
        gsap.to(cameraRef.current.position, { x: 16, y: 12, z: 20, duration: 1.2, ease: 'power2.out' });
      } else if (view_mode === 'underground_drainage') {
        controlsRef.current.target.set(0, 1.2, 0);
        gsap.to(cameraRef.current.position, { x: 14, y: 7, z: 12, duration: 1.2, ease: 'power2.out' });
      } else if (view_mode === 'courtyard_house') {
        controlsRef.current.target.set(0, 2.5, 0);
        gsap.to(cameraRef.current.position, { x: 18, y: 14, z: 18, duration: 1.2, ease: 'power2.out' });
      } else if (view_mode === 'granary_ventilation') {
        controlsRef.current.target.set(0, 2, 0);
        gsap.to(cameraRef.current.position, { x: 18, y: 10, z: 14, duration: 1.2, ease: 'power2.out' });
      }
    }

    // 3. Bitumen Layer Visibility
    const bathGrp = groupsRef.current['great_bath_cutaway'];
    if (bathGrp) {
      bathGrp.traverse((child) => {
        if (child.name === 'bitumen_layer') {
          child.visible = bitumen_layer_visible;
        }
      });
    }

    // 4. Sun Angle Directional Lighting
    if (sunLightRef.current) {
      const rad = (sun_angle_deg * Math.PI) / 180;
      sunLightRef.current.position.set(Math.cos(rad) * 25, Math.sin(rad) * 25, 12);
    }
  }, [view_mode, bitumen_layer_visible, sun_angle_deg, water_fill_level_m]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. Header with dynamic badge */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-amber-600 bg-clip-text text-transparent">
                Indus Valley Civilization: 3D Urban Architecture & Hydraulic Engineering
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Interactive 3D exploration of Mohenjo-daro: standardized 1:2:4 baked brick bonding, bitumen waterproofing & gravity sewers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/80 border border-amber-700/50 text-amber-300">
              Circa 2500 BCE (Mature Harappan)
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
              3D WebGL (Three.js Orbit)
            </span>
          </div>
        </header>

        {/* 2. Telemetry HUD Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {telemetryMetrics.map((metric) => (
            <div key={metric.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 shadow-lg backdrop-blur flex flex-col justify-between hover:border-amber-500/40 transition-colors">
              <div className="text-xs text-slate-400 truncate">{metric.label}</div>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className="text-lg font-bold tracking-tight text-white">{metric.value}</span>
                <span className="text-[11px] text-slate-500">{metric.unit}</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-full" />
              </div>
            </div>
          ))}
        </section>

        {/* 3. Dedicated Simulation Stage: 3D WebGL Canvas with OrbitControls */}
        <section className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              3D Architectural Viewport • Drag to Orbit (360°) • Scroll to Zoom • Right-Click to Pan
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 font-mono">
              Active: {view_mode.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          <div
            ref={mountRef}
            className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-800 bg-[#070b14] relative shadow-inner cursor-grab active:cursor-grabbing"
            style={{ minHeight: '500px', height: '500px' }}
          />
        </section>

        {/* 4. Interactive Control Deck Grid */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Architectural Controls & Environmental Variables
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Control 1: View Mode Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Architectural Section Focus</label>
              <select
                value={view_mode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-amber-300 focus:outline-none focus:border-amber-500"
              >
                <option value="great_bath_cutaway">The Great Bath & Bitumen Tank</option>
                <option value="underground_drainage">Subterranean Sewer Network</option>
                <option value="courtyard_house">Domestic Courtyard House</option>
                <option value="granary_ventilation">Granary Moisture-Control Ducts</option>
              </select>
              <span className="text-[11px] text-slate-500 block">Switch 3D architectural model</span>
            </div>

            {/* Control 2: Great Bath Water Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Bath Water Fill Depth</span>
                <span className="text-cyan-400 font-semibold">{water_fill_level_m.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.4"
                step="0.1"
                value={water_fill_level_m}
                onChange={(e) => setWaterFillLevel(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-[11px] text-slate-500 block">Max pool capacity: 2.4 m</span>
            </div>

            {/* Control 3: Sun Angle (Shadows) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Sun Altitude Angle</span>
                <span className="text-amber-400 font-semibold">{sun_angle_deg}°</span>
              </div>
              <input
                type="range"
                min="15"
                max="165"
                step="5"
                value={sun_angle_deg}
                onChange={(e) => setSunAngleDeg(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[11px] text-slate-500 block">Shadow depth analysis</span>
            </div>

            {/* Control 4: Outside Summer Heat */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Ambient Summer Temp</span>
                <span className="text-rose-400 font-semibold">{ambient_outside_temp_c}°C</span>
              </div>
              <input
                type="range"
                min="30"
                max="50"
                step="1"
                value={ambient_outside_temp_c}
                onChange={(e) => setAmbientOutsideTemp(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="text-[11px] text-slate-500 block">Courtyard stays at {courtyard_interior_temp_c.toFixed(1)}°C</span>
            </div>

            {/* Toggle 1: Bitumen Waterproofing */}
            <div className="flex flex-col justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-xs font-medium text-slate-300">Inspect Bitumen Waterproofing</span>
              <button
                type="button"
                onClick={() => setBitumenLayerVisible(!bitumen_layer_visible)}
                className={`mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${bitumen_layer_visible ? 'bg-amber-600 text-white shadow-amber-900/40 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {bitumen_layer_visible ? '✓ Natural Asphalt Pitch: VISIBLE' : 'Layer Hidden'}
              </button>
            </div>

            {/* Toggle 2: Sewer Drainage Flow */}
            <div className="flex flex-col justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-xs font-medium text-slate-300">Subterranean Sewer Flow</span>
              <button
                type="button"
                onClick={() => setSewageFlowActive(!sewage_flow_active)}
                className={`mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${sewage_flow_active ? 'bg-cyan-600 text-white shadow-cyan-900/40 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {sewage_flow_active ? '✓ Gravity Drainage Active (1:50)' : 'Flow Stopped'}
              </button>
            </div>
          </div>
        </section>

        {/* 5. Educational Theory Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {educationalCards.map((card, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <h3 className="text-sm font-bold text-slate-200 mb-2">{card.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{card.content}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
