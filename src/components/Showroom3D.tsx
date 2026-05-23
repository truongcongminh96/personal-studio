import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { soundManager } from './SoundManager';

interface Showroom3DProps {
  activeProject: number;
  viewMode: 'explore' | 'focus';
  onCameraChange: (yawDegrees: number, posX: number, posZ: number) => void;
  onCardClick: (index: number) => void;
}

export const Showroom3D: React.FC<Showroom3DProps> = ({
  activeProject,
  viewMode,
  onCameraChange,
  onCardClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Refs to allow animation loop to read latest state without re-creating scene
  const activeProjectRef = useRef(activeProject);
  const viewModeRef = useRef(viewMode);

  useEffect(() => {
    activeProjectRef.current = activeProject;
    viewModeRef.current = viewMode;
  }, [activeProject, viewMode]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- 1. SETUP RENDERER & SCENE ---
    const width = canvasRef.current.parentElement?.clientWidth || window.innerWidth;
    const height = canvasRef.current.parentElement?.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020204);
    scene.fog = new THREE.FogExp2(0x020204, 0.05);

    // --- 2. CAMERA ---
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 100);
    // Initial camera position (panoramic entrance view)
    camera.position.set(0, 2.2, 7.5);

    // Camera target vectors for smooth tweening (lerp)
    const targetCamPos = new THREE.Vector3().copy(camera.position);
    const currentLookAt = new THREE.Vector3(0, 1.2, -1);
    const targetLookAt = new THREE.Vector3(0, 1.2, -1);

    // --- 3. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x0c0d12, 1.8);
    scene.add(ambientLight);

    // Neon Cyan light source (left)
    const cyanLight = new THREE.PointLight(0x00e5ff, 5.0, 18);
    cyanLight.position.set(-6, 4.0, -2);
    scene.add(cyanLight);

    // Neon Magenta light source (right)
    const magentaLight = new THREE.PointLight(0xff007f, 5.0, 18);
    magentaLight.position.set(6, 4.0, -2);
    scene.add(magentaLight);

    // Directional rim light for metallic contours
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
    rimLight.position.set(0, 9, -4);
    scene.add(rimLight);

    // --- 4. GEOMETRY: SHOWROOM ENVIRONMENT ---
    
    // Glossy Reflective Floor
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x05070a,
      roughness: 0.10, // Glossy reflective
      metalness: 0.92,  // Highly metallic
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    // Floor digital grid lines for depth
    const gridHelper = new THREE.GridHelper(40, 30, 0x00e5ff, 0x112233);
    gridHelper.position.y = 0.005;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.22;
    scene.add(gridHelper);

    // Back Wall Panels
    const wallGeo = new THREE.PlaneGeometry(40, 12);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x040507,
      roughness: 0.35,
      metalness: 0.85,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 6, -9);
    scene.add(backWall);

    // Architectural Symmetrical Columns (Dark Metal)
    const columnGeo = new THREE.BoxGeometry(1.0, 12, 1.0);
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x080a0e,
      roughness: 0.18,
      metalness: 0.85,
    });

    const columns: THREE.Mesh[] = [];
    const colPositions = [-9, -4.5, 4.5, 9];
    colPositions.forEach((xPos) => {
      const col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(xPos, 6, -8.5);
      scene.add(col);
      columns.push(col);
    });

    // Glowing Neon Crossed Tubes on the back wall (Matching the mockup)
    const tubeGeo = new THREE.CylinderGeometry(0.05, 0.05, 14, 8);
    const cyanTubeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const magentaTubeMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

    // Crossed lines in center-right back wall
    const cyanCrossTube = new THREE.Mesh(tubeGeo, cyanTubeMat);
    cyanCrossTube.position.set(3.5, 4.5, -8.8);
    cyanCrossTube.rotation.z = Math.PI / 4.2;
    scene.add(cyanCrossTube);

    const magentaCrossTube = new THREE.Mesh(tubeGeo, magentaTubeMat);
    magentaCrossTube.position.set(3.5, 4.5, -8.8);
    magentaCrossTube.rotation.z = -Math.PI / 4.2;
    scene.add(magentaCrossTube);

    // Symmetrical diagonal neon strips on the sides
    const leftNeonStrip = new THREE.Mesh(tubeGeo, cyanTubeMat);
    leftNeonStrip.position.set(-8, 4.5, -8.8);
    leftNeonStrip.rotation.z = -Math.PI / 5.5;
    scene.add(leftNeonStrip);

    const rightNeonStrip = new THREE.Mesh(tubeGeo, magentaTubeMat);
    rightNeonStrip.position.set(8, 4.5, -8.8);
    rightNeonStrip.rotation.z = Math.PI / 5.5;
    scene.add(rightNeonStrip);

    // --- 5. FLOATING 3D PROJECT CARDS WITH PROCEDURAL GRAPHICS ---
    const createRichCardTexture = (index: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 768;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Glassmorphic translucent dark background
      ctx.fillStyle = 'rgba(4, 5, 8, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Card configurations
      const configs = [
        {
          title: "AI AGENTS WORKFLOW",
          subtitle: "MULTI-AGENT ENGINE CORE",
          tag: "AGENTIC AI SYSTEM",
          color: "#ff007f", // Magenta
          colorGlow: "rgba(255, 0, 127, 0.4)",
          btnText: "LAUNCH ENGINE >",
          drawArt: () => {
            // Neural net nodes and coordinates
            ctx.strokeStyle = 'rgba(255, 0, 127, 0.15)';
            ctx.lineWidth = 1;
            const nodes = [
              { x: 380, y: 120 }, { x: 440, y: 220 }, { x: 500, y: 150 }, 
              { x: 580, y: 240 }, { x: 620, y: 110 }, { x: 690, y: 200 }
            ];
            // Lines
            for (let i = 0; i < nodes.length; i++) {
              for (let j = i + 1; j < nodes.length; j++) {
                const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                if (dist < 180) {
                  ctx.beginPath();
                  ctx.moveTo(nodes[i].x, nodes[i].y);
                  ctx.lineTo(nodes[j].x, nodes[j].y);
                  ctx.stroke();
                }
              }
            }
            // Glow Nodes
            nodes.forEach((n, i) => {
              ctx.beginPath();
              ctx.arc(n.x, n.y, i % 2 === 0 ? 6 : 4, 0, Math.PI * 2);
              ctx.fillStyle = i === 1 ? '#ffffff' : '#ff007f';
              ctx.shadowColor = '#ff007f';
              ctx.shadowBlur = 10;
              ctx.fill();
              ctx.shadowBlur = 0;
            });
          }
        },
        {
          title: "HYBRID RAG DATABASE",
          subtitle: "SEMANTIC DOCUMENT RETRIEVAL",
          tag: "VECTOR SEARCH NETWORK",
          color: "#00e5ff", // Cyan
          colorGlow: "rgba(0, 229, 255, 0.4)",
          btnText: "ACCESS DATABASE >",
          drawArt: () => {
            // Coordinate grid lattices and bar metrics
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
            ctx.lineWidth = 1;
            // Draw a futuristic semantic index chart
            ctx.beginPath();
            ctx.arc(540, 170, 60, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(540, 170, 30, 0, Math.PI * 2);
            ctx.stroke();

            // Intersecting rays
            ctx.fillStyle = '#00e5ff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 8;
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
              const rx = 540 + Math.cos(a) * 60;
              const ry = 170 + Math.sin(a) * 60;
              ctx.beginPath();
              ctx.arc(rx, ry, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            
            // Vertical digital bars
            ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
            ctx.shadowBlur = 0;
            const barData = [60, 120, 80, 140, 110];
            barData.forEach((h, idx) => {
              ctx.fillRect(630 + idx * 16, 230 - h, 10, h);
              ctx.fillStyle = '#00e5ff';
              ctx.fillRect(630 + idx * 16, 230 - h, 10, 3);
              ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
            });
          }
        },
        {
          title: "PEFT MODEL FINE-TUNE",
          subtitle: "QUANTIZED COGNITIVE INTELLIGENCE",
          tag: "DEEP LEARNING PIPELINE",
          color: "#00e5ff", // Cyan
          colorGlow: "rgba(0, 229, 255, 0.4)",
          btnText: "RUN WORKFLOW >",
          drawArt: () => {
            // Horizontal neural model layer boxes and parameter blocks
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(400, 120, 80, 80);
            ctx.strokeRect(520, 100, 80, 120);
            ctx.strokeRect(640, 120, 80, 80);
            
            // Connection paths
            ctx.beginPath();
            ctx.moveTo(480, 160);
            ctx.lineTo(520, 160);
            ctx.moveTo(600, 160);
            ctx.lineTo(640, 160);
            ctx.stroke();

            // Inner glowing values
            ctx.fillStyle = '#ffffff';
            ctx.font = '600 10px "Orbitron", sans-serif';
            ctx.fillText("Llama-3", 440, 162);
            ctx.fillText("PEFT Adapter", 560, 162);
            ctx.fillText("TensorRT", 680, 162);

            ctx.fillStyle = '#00e5ff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 8;
            ctx.fillText("LoRA", 560, 130);
            ctx.fillText("FP16", 560, 190);
            ctx.shadowBlur = 0;
          }
        },
        {
          title: "WEBGL 3D INTERACTIVES",
          subtitle: "HARDWARE-ACCELERATED GRAPHICS",
          tag: "GPU SHADER LAB",
          color: "#ff007f", // Magenta
          colorGlow: "rgba(255, 0, 127, 0.4)",
          btnText: "EXECUTE PROTOTYPE >",
          drawArt: () => {
            // Vector orbits / particle vortex
            ctx.strokeStyle = 'rgba(255, 0, 127, 0.15)';
            ctx.lineWidth = 1;
            
            // Render beautiful overlapping planetary ellipses representing shader paths
            ctx.beginPath();
            ctx.ellipse(540, 160, 100, 35, Math.PI / 6, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.ellipse(540, 160, 100, 35, -Math.PI / 6, 0, Math.PI * 2);
            ctx.stroke();

            // Particle nodes
            ctx.fillStyle = '#ff007f';
            ctx.shadowColor = '#ff007f';
            ctx.shadowBlur = 10;
            const points = [
              { x: 460, y: 110 }, { x: 620, y: 210 }, 
              { x: 450, y: 200 }, { x: 610, y: 110 }, { x: 540, y: 160 }
            ];
            points.forEach((p, idx) => {
              ctx.beginPath();
              ctx.arc(p.x, p.y, idx === 4 ? 6 : 4, 0, Math.PI * 2);
              ctx.fillStyle = idx === 4 ? '#ffffff' : '#ff007f';
              ctx.fill();
            });
            ctx.shadowBlur = 0;
          }
        }
      ];

      const c = configs[index];

      // --- DECORATIVE HUD DETAILS ---
      // Outer digital corner bezels
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 4;
      const bSize = 30;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(12, 12 + bSize); ctx.lineTo(12, 12); ctx.lineTo(12 + bSize, 12);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(canvas.width - 12, 12 + bSize); ctx.lineTo(canvas.width - 12, 12); ctx.lineTo(canvas.width - 12 - bSize, 12);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(12, canvas.height - 12 - bSize); ctx.lineTo(12, canvas.height - 12); ctx.lineTo(12 + bSize, canvas.height - 12);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(canvas.width - 12, canvas.height - 12 - bSize); ctx.lineTo(canvas.width - 12, canvas.height - 12); ctx.lineTo(canvas.width - 12 - bSize, canvas.height - 12);
      ctx.stroke();

      // Border bounds line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

      // Fine grid background details
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 24; i < canvas.width; i += 24) {
        ctx.beginPath(); ctx.moveTo(i, 12); ctx.lineTo(i, canvas.height - 12); ctx.stroke();
      }
      for (let j = 24; j < canvas.height; j += 24) {
        ctx.beginPath(); ctx.moveTo(12, j); ctx.lineTo(canvas.width - 12, j); ctx.stroke();
      }

      // --- TEXT LABELS (Left Side) ---
      // Category Tag
      ctx.fillStyle = c.color;
      ctx.font = '800 12px "Orbitron", sans-serif';
      ctx.shadowColor = c.colorGlow;
      ctx.shadowBlur = 6;
      ctx.fillText(c.tag, 42, 65);
      ctx.shadowBlur = 0;

      // Project Title (Large Bold White - Apechain Mockup style)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px "Orbitron", sans-serif';
      ctx.fillText(c.title, 42, 115);

      // Subtitle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '600 12px "Orbitron", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(c.subtitle, 42, 145);

      // System Log details (Cyber text details)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '500 12px "Inter", sans-serif';
      ctx.letterSpacing = '0px';
      
      const detailsText = [
        "SYSTEM ENGINES BOUND TO HW ACCELERATORS",
        "INPUT STREAM PORT: SECURE RAW SHELL (SSL)",
        "STATUS METRICS CORRELATION: OPERATIONAL",
        "COGNITIVE LATENCY: CRITICAL SECURE GROUNDED"
      ];
      detailsText.forEach((t, i) => {
        ctx.fillStyle = c.color;
        ctx.fillText("▶", 42, 200 + i * 22);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(t, 60, 200 + i * 22);
      });

      // --- DYNAMIC ART ILLUSTRATION (Right Side) ---
      c.drawArt();

      // --- LAUNCH WHITE PILL BUTTON (Bottom Left - Apechain style) ---
      const btnX = 42;
      const btnY = 380;
      const btnW = 210;
      const btnH = 46;
      const btnRad = 23;

      // Draw shiny white button
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 12;
      
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, btnRad);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Button Text
      ctx.fillStyle = '#030306';
      ctx.font = '900 12px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.btnText, btnX + btnW / 2, btnY + btnH / 2);

      // Reset textAlign
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      return new THREE.CanvasTexture(canvas);
    };

    // Enlarged dynamic project cards for the 3D cover flow (Apechain width aspect)
    // Larger cards: 3.5 width, 2.3 height
    const cardGeom = new THREE.BoxGeometry(3.5, 2.3, 0.06);
    const cards: THREE.Mesh[] = [];

    // Store card base textures for reference
    const cardTextures: THREE.CanvasTexture[] = [];

    for (let i = 0; i < 4; i++) {
      const richTex = createRichCardTexture(i);
      cardTextures.push(richTex);

      // Glowing basic material to ensure crisp, self-luminous retro cyber-monitor text and visuals
      const cardMat = new THREE.MeshBasicMaterial({
        map: richTex,
        transparent: true,
        opacity: 0.96,
        side: THREE.DoubleSide,
      });

      const card = new THREE.Mesh(cardGeom, cardMat);
      
      // Initial offset positioning to spread them out on loading
      card.position.set((i - 1.5) * 4.0, 1.1, -1.0);
      scene.add(card);
      cards.push(card);
    }

    // --- 6. INTERACTION LOGIC: RAYCASTING ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredCardIdx: number | null = null;

    // Tracks mouse position for parallax drift
    const mouseParallax = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Parallax values
      mouseParallax.x = mouse.x;
      mouseParallax.y = mouse.y;

      // Card Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cards);

      if (intersects.length > 0) {
        const intersectedCard = intersects[0].object as THREE.Mesh;
        const intersectedIdx = cards.indexOf(intersectedCard);

        if (hoveredCardIdx !== intersectedIdx) {
          soundManager.playHover();
          hoveredCardIdx = intersectedIdx;
          document.body.style.cursor = 'pointer';
        }
      } else {
        if (hoveredCardIdx !== null) {
          hoveredCardIdx = null;
          document.body.style.cursor = 'default';
        }
      }
    };

    const handleMouseDown = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cards);

      if (intersects.length > 0) {
        const clickedCard = intersects[0].object as THREE.Mesh;
        const clickedIdx = cards.indexOf(clickedCard);
        
        soundManager.playClick();
        onCardClick(clickedIdx);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    // --- 7. ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Read active state from refs
      const curActiveProject = activeProjectRef.current;
      const curViewMode = viewModeRef.current;

      // --- 1. COVER-FLOW 3D PERSPECTIVE CAROUSEL ALIGNMENTS ---
      cards.forEach((card, idx) => {
        // Calculate dynamic offset from active project, wrapping around a 4-card sequence
        let offset = idx - curActiveProject;
        if (offset < -2) offset += 4;
        if (offset > 2) offset -= 4;

        let targetX = 0;
        let targetY = 1.1;
        let targetZ = 0;
        let targetRotY = 0;
        let targetScale = 1.0;

        if (curViewMode === 'explore') {
          // EXPLORE MODE: Curved static array in space
          targetX = (idx - 1.5) * 3.4;
          targetZ = -Math.abs(targetX) * 0.18 - 1.5;
          targetRotY = -targetX * 0.08;
          targetScale = 1.0;
        } else {
          // FOCUS MODE: COVER FLOW CAROUSEL (Enlarged Active card center, Neighbors offset and rotated back)
          if (offset === 0) {
            // Active Center Card: large, facing camera directly, pulled forward
            targetX = -0.55; // Offset slightly to the left to balance the right sidebar console!
            targetZ = 1.25;
            targetRotY = -0.05; // Gentle tilt
            targetScale = 1.15;
          } else if (offset === -1 || offset === 3) {
            // Card on Left: shifted left, tilted deeply inwards towards center
            targetX = -3.5;
            targetZ = -0.3;
            targetRotY = 0.52; // Tilted inwards
            targetScale = 0.82;
          } else if (offset === 1 || offset === -3) {
            // Card on Right: shifted right, tilted deeply inwards towards center
            targetX = 2.4;
            targetZ = -0.3;
            targetRotY = -0.52; // Tilted inwards
            targetScale = 0.82;
          } else {
            // Card behind / opposite: pushed far back, small scale
            targetX = offset < 0 ? -4.5 : 4.5;
            targetZ = -2.2;
            targetRotY = offset < 0 ? 0.6 : -0.6;
            targetScale = 0.55;
          }
        }

        // Floating sine animation on Y axis
        const floatFreq = 1.1;
        const floatAmp = 0.04;
        const floatOffset = Math.sin(time * floatFreq + idx * 1.5) * floatAmp;
        const finalTargetY = targetY + floatOffset;

        // Dynamic Focal Brightness Tinting (Active & Hovered cards are full bright, others are dimmed)
        let targetColorVal = 0x6e7682; // Dimmed color for background cards
        if (idx === curActiveProject || hoveredCardIdx === idx) {
          targetColorVal = 0xffffff; // Full brilliant original canvas colors
        }

        // Apply smooth interpolation (Lerp) to positions, rotations, and scales
        card.position.x = THREE.MathUtils.lerp(card.position.x, targetX, 0.07);
        card.position.y = THREE.MathUtils.lerp(card.position.y, finalTargetY, 0.07);
        card.position.z = THREE.MathUtils.lerp(card.position.z, targetZ, 0.07);
        
        card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, targetRotY, 0.07);
        
        const currentSc = card.scale.x;
        const nextSc = THREE.MathUtils.lerp(currentSc, targetScale, 0.07);
        card.scale.set(nextSc, nextSc, nextSc);

        // Apply color glow/tint modifications on basic materials
        const mat = card.material as THREE.MeshBasicMaterial;
        mat.color.lerp(new THREE.Color(targetColorVal), 0.08);
      });

      // --- 2. CAMERA TWEENING CALCULATIONS ---
      if (curViewMode === 'explore') {
        // Panoramic pan: Orbiting coordinate + mouse parallax drift
        const targetX = Math.sin(time * 0.08) * 1.0 + mouseParallax.x * 0.5;
        const targetY = 2.1 + Math.cos(time * 0.08) * 0.15 + mouseParallax.y * 0.25;
        const targetZ = 6.4 + Math.sin(time * 0.04) * 0.3;
        
        targetCamPos.set(targetX, targetY, targetZ);
        targetLookAt.set(0, 1.1, -1);
      } else {
        // Focus mode: Camera sits at a gorgeous panoramic viewpoint, letting the Cover Flow carousel center the projects
        // Positioned slightly higher and tilted down looking at the centered active card
        const targetX = mouseParallax.x * 0.25;
        const targetY = 1.7 + mouseParallax.y * 0.15;
        const targetZ = 4.4; // Tighter focus

        targetCamPos.set(targetX, targetY, targetZ);
        // Look towards the center project region
        targetLookAt.set(-0.5, 1.1, 0.5);
      }

      // Smooth camera interpolation
      camera.position.lerp(targetCamPos, 0.06);
      currentLookAt.lerp(targetLookAt, 0.06);
      camera.lookAt(currentLookAt);

      // Render scene
      renderer.render(scene, camera);

      // --- 3. EMIT CAMERA DATA TO HUD ---
      const dirVector = new THREE.Vector3();
      camera.getWorldDirection(dirVector);
      const yawAngle = Math.atan2(dirVector.x, dirVector.z);
      let yawDegrees = yawAngle * (180 / Math.PI);
      if (yawDegrees < 0) yawDegrees += 360;

      onCameraChange(yawDegrees, camera.position.x, camera.position.z);
    };

    animate();

    // --- 8. RESIZE HANDLING ---
    const handleResize = () => {
      if (!canvasRef.current || !canvasRef.current.parentElement) return;
      const w = canvasRef.current.parentElement.clientWidth;
      const h = canvasRef.current.parentElement.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // --- 9. CLEANUP ---
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      floorGeo.dispose();
      floorMat.dispose();
      gridHelper.dispose();
      wallGeo.dispose();
      wallMat.dispose();
      columnGeo.dispose();
      columnMat.dispose();
      tubeGeo.dispose();
      cyanTubeMat.dispose();
      magentaTubeMat.dispose();
      
      cardGeom.dispose();
      cards.forEach((card) => {
        const mat = card.material as THREE.MeshPhysicalMaterial;
        mat.map?.dispose();
        mat.dispose();
      });
      cardTextures.forEach((tex) => tex.dispose());

      renderer.dispose();
    };
  }, [onCameraChange, onCardClick]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};
export default Showroom3D;
