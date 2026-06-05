import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { projects, PROJECT_COUNT } from '../data/projects';
import { createDoodleTexture, createRichCardTexture } from '../utils/canvasTextures';

interface Showroom3DProps {
  activeProject: number;
  viewMode: 'explore' | 'focus';
  onCameraChange: (yawDegrees: number, posX: number, posZ: number) => void;
  onCardClick: (index: number) => void;
}

const doodleConfigs = [
  { kind: 'star' as const, color: '#fff0a8', x: -5.8, y: 4.2, z: -5.8, s: 0.74 },
  { kind: 'heart' as const, color: '#ffc4ce', x: -2.9, y: 4.9, z: -6.8, s: 0.52 },
  { kind: 'cloud' as const, color: '#fff7ea', x: 0.1, y: 3.9, z: -7.2, s: 1.0 },
  { kind: 'star' as const, color: '#ffe5a4', x: 3.2, y: 4.7, z: -6.4, s: 0.54 },
  { kind: 'heart' as const, color: '#f8b7c4', x: 6.2, y: 4.1, z: -6.0, s: 0.46 },
];

const createGlowTexture = (colorStr: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, colorStr);
  grad.addColorStop(0.35, colorStr + '77'); // transparent glow
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export const Showroom3D: React.FC<Showroom3DProps> = ({
  activeProject,
  viewMode,
  onCameraChange,
  onCardClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeProjectRef = useRef(activeProject);
  const viewModeRef = useRef(viewMode);

  useEffect(() => {
    activeProjectRef.current = activeProject;
    viewModeRef.current = viewMode;
  }, [activeProject, viewMode]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.parentElement?.clientWidth || window.innerWidth;
    const height = canvasRef.current.parentElement?.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const disposableMaterials: THREE.Material[] = [];
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableTextures: THREE.Texture[] = [];

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffeadf, 0.045);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 7.5);

    const targetCamPos = new THREE.Vector3().copy(camera.position);
    const currentLookAt = new THREE.Vector3(0, 1.2, -1);
    const targetLookAt = new THREE.Vector3(0, 1.2, -1);

    const ambientLight = new THREE.HemisphereLight(0xfff7df, 0xaed8cd, 2.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffc6a8, 2.8);
    sunLight.position.set(-5.5, 7.5, 4);
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(0xd7c9ff, 1.8, 20);
    fillLight.position.set(5, 3.8, 1);
    scene.add(fillLight);

    const doodleSprites: THREE.Sprite[] = [];
    doodleConfigs.forEach((doodle) => {
      const tex = createDoodleTexture(doodle.kind, doodle.color);
      disposableTextures.push(tex);
      const material = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.92,
      });
      disposableMaterials.push(material);
      const sprite = new THREE.Sprite(material);
      sprite.position.set(doodle.x, doodle.y, doodle.z);
      sprite.scale.set(doodle.s, doodle.s, 1);
      scene.add(sprite);
      doodleSprites.push(sprite);
    });

    const cardGeom = new THREE.BoxGeometry(3.5, 2.3, 0.06);
    disposableGeometries.push(cardGeom);
    const cards: THREE.Mesh[] = [];

    for (let i = 0; i < PROJECT_COUNT; i++) {
      const richTex = createRichCardTexture(i, projects[i]);
      disposableTextures.push(richTex);

      const cardMat = new THREE.MeshBasicMaterial({
        map: richTex,
        transparent: true,
        opacity: 0.98,
        side: THREE.DoubleSide,
      });
      disposableMaterials.push(cardMat);

      const card = new THREE.Mesh(cardGeom, cardMat);
      card.position.set((i - 1.5) * 4.0, 1.1, -1.0);
      scene.add(card);
      cards.push(card);
    }

    const haloGeom = new THREE.PlaneGeometry(4.8, 3.4);
    disposableGeometries.push(haloGeom);
    const cardHalos: THREE.Mesh[] = [];

    for (let i = 0; i < PROJECT_COUNT; i++) {
      const glowTex = createGlowTexture(projects[i].accent);
      disposableTextures.push(glowTex);

      const haloMat = new THREE.MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposableMaterials.push(haloMat);

      const halo = new THREE.Mesh(haloGeom, haloMat);
      halo.position.set((i - 1.5) * 4.0, 1.1, -1.08);
      scene.add(halo);
      cardHalos.push(halo);
    }

    // Generate circular particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 16, 16);
    const pTex = new THREE.CanvasTexture(pCanvas);
    disposableTextures.push(pTex);

    const particleCount = 220;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 12 + 1.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
      particleSpeeds[i] = 0.05 + Math.random() * 0.15;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    disposableGeometries.push(particleGeom);

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      map: pTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposableMaterials.push(particleMat);

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredCardIdx: number | null = null;
    const mouseParallax = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      mouseParallax.x = mouse.x;
      mouseParallax.y = mouse.y;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cards);

      if (intersects.length > 0) {
        const intersectedCard = intersects[0].object as THREE.Mesh;
        const intersectedIdx = cards.indexOf(intersectedCard);

        if (hoveredCardIdx !== intersectedIdx) {
          hoveredCardIdx = intersectedIdx;
          document.body.style.cursor = 'pointer';
        }
      } else if (hoveredCardIdx !== null) {
        hoveredCardIdx = null;
        document.body.style.cursor = 'default';
      }
    };

    const handleMouseDown = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cards);

      if (intersects.length > 0) {
        const clickedCard = intersects[0].object as THREE.Mesh;
        const clickedIdx = cards.indexOf(clickedCard);

        onCardClick(clickedIdx);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const startTime = performance.now();
    let animationFrameId: number;

    const whiteColor = new THREE.Color(0xffffff);
    const dimColor = new THREE.Color(0xd7d3e8);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) / 1000;
      const curActiveProject = activeProjectRef.current;
      const curViewMode = viewModeRef.current;

      doodleSprites.forEach((sprite, idx) => {
        sprite.position.y += Math.sin(time * 0.8 + idx) * 0.0009;
        sprite.material.rotation = Math.sin(time * 0.35 + idx) * 0.08;
      });

      cards.forEach((card, idx) => {
        let offset = idx - curActiveProject;
        if (offset < -2) offset += 4;
        if (offset > 2) offset -= 4;

        let targetX: number;
        const targetY = 1.1;
        let targetZ: number;
        let targetRotY: number;
        let targetScale: number;
        let targetOpacity: number;

        if (curViewMode === 'explore') {
          // Elegant arc layout — all 4 cards clearly visible
          const arcPositions = [
            { x: -5.0, z: -1.6, rotY: 0.32, scale: 0.88, opacity: 0.92 },  // outer left
            { x: -1.7, z: -0.4, rotY: 0.06, scale: 1.03, opacity: 0.98 },  // inner left
            { x: 1.7,  z: -0.4, rotY: -0.06, scale: 1.03, opacity: 0.98 }, // inner right
            { x: 5.0,  z: -1.6, rotY: -0.32, scale: 0.88, opacity: 0.92 }, // outer right
          ];
          const pos = arcPositions[idx] || arcPositions[0];
          targetX = pos.x;
          targetZ = pos.z;
          targetRotY = pos.rotY;
          targetScale = pos.scale;
          targetOpacity = pos.opacity;
        } else if (offset === 0) {
          targetX = -0.55;
          targetZ = 1.25;
          targetRotY = -0.05;
          targetScale = 1.15;
          targetOpacity = 0.98;
        } else if (offset === -1 || offset === 3) {
          targetX = -3.5;
          targetZ = -0.3;
          targetRotY = 0.52;
          targetScale = 0.82;
          targetOpacity = 0.88;
        } else if (offset === 1 || offset === -3) {
          targetX = 2.4;
          targetZ = -0.3;
          targetRotY = -0.52;
          targetScale = 0.82;
          targetOpacity = 0.88;
        } else {
          targetX = offset < 0 ? -4.5 : 4.5;
          targetZ = -2.2;
          targetRotY = offset < 0 ? 0.6 : -0.6;
          targetScale = 0.55;
          targetOpacity = 0.64;
        }

        const floatOffset = Math.sin(time * 1.1 + idx * 1.5) * 0.055;
        const finalTargetY = targetY + floatOffset;
        const targetColor = idx === curActiveProject || hoveredCardIdx === idx ? whiteColor : dimColor;

        card.position.x = THREE.MathUtils.lerp(card.position.x, targetX, 0.07);
        card.position.y = THREE.MathUtils.lerp(card.position.y, finalTargetY, 0.07);
        card.position.z = THREE.MathUtils.lerp(card.position.z, targetZ, 0.07);
        card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, targetRotY, 0.07);

        const nextScale = THREE.MathUtils.lerp(card.scale.x, targetScale, 0.07);
        card.scale.set(nextScale, nextScale, nextScale);

        const mat = card.material as THREE.MeshBasicMaterial;
        mat.color.lerp(targetColor, 0.08);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

        // ── Card Backlight Halo Animation ──
        const halo = cardHalos[idx];
        if (halo) {
          halo.position.x = card.position.x;
          halo.position.y = card.position.y;
          halo.position.z = THREE.MathUtils.lerp(halo.position.z, targetZ - 0.08, 0.07);
          halo.rotation.y = card.rotation.y;

          const isFocused = idx === curActiveProject && curViewMode === 'focus';
          const isHovered = hoveredCardIdx === idx;
          
          let targetHaloOpacity = 0;
          let haloPulseScale = 1;

          if (isFocused) {
            targetHaloOpacity = 0.88;
            haloPulseScale = 1.05 + Math.sin(time * 3.5) * 0.04;
          } else if (isHovered) {
            targetHaloOpacity = 0.58;
            haloPulseScale = 1.03 + Math.sin(time * 2.0) * 0.02;
          } else if (curViewMode === 'explore') {
            targetHaloOpacity = 0.22;
            haloPulseScale = 0.98 + Math.sin(time * 1.2 + idx) * 0.015;
          }

          const targetHaloScale = targetScale * haloPulseScale;
          const nextHaloScale = THREE.MathUtils.lerp(halo.scale.x, targetHaloScale, 0.07);
          halo.scale.set(nextHaloScale, nextHaloScale, nextHaloScale);

          const hMat = halo.material as THREE.MeshBasicMaterial;
          hMat.opacity = THREE.MathUtils.lerp(hMat.opacity, targetHaloOpacity, 0.08);
        }
      });

      // ── Drift particles dynamically ──
      if (particles && particleGeom) {
        const posAttr = particleGeom.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          let py = posAttr.getY(i);
          py += particleSpeeds[i] * 0.035;
          if (py > 7.0) py = -5.0;
          posAttr.setY(i, py);

          const px = posAttr.getX(i);
          posAttr.setX(i, px + Math.sin(time * 0.4 + i) * 0.0018);
        }
        posAttr.needsUpdate = true;

        // Rotate the particle field slightly with mouse parallax
        particles.rotation.y = mouseParallax.x * 0.08;
        particles.rotation.x = -mouseParallax.y * 0.08;
      }

      if (curViewMode === 'explore') {
        const targetX = Math.sin(time * 0.08) + mouseParallax.x * 0.5;
        const targetY = 2.3 + Math.cos(time * 0.08) * 0.15 + mouseParallax.y * 0.25;
        const targetZ = 7.2 + Math.sin(time * 0.04) * 0.3;

        targetCamPos.set(targetX, targetY, targetZ);
        targetLookAt.set(0, 0.9, -1.2);
      } else {
        const targetX = mouseParallax.x * 0.25;
        const targetY = 1.7 + mouseParallax.y * 0.15;
        const targetZ = 4.4;

        targetCamPos.set(targetX, targetY, targetZ);
        targetLookAt.set(-0.5, 1.1, 0.5);
      }

      camera.position.lerp(targetCamPos, 0.06);
      currentLookAt.lerp(targetLookAt, 0.06);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);

      const dirVector = new THREE.Vector3();
      camera.getWorldDirection(dirVector);
      const yawAngle = Math.atan2(dirVector.x, dirVector.z);
      let yawDegrees = yawAngle * (180 / Math.PI);
      if (yawDegrees < 0) yawDegrees += 360;

      onCameraChange(yawDegrees, camera.position.x, camera.position.z);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current || !canvasRef.current.parentElement) return;
      const w = canvasRef.current.parentElement.clientWidth;
      const h = canvasRef.current.parentElement.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      document.body.style.cursor = 'default';

      disposableGeometries.forEach((geometry) => geometry.dispose());
      disposableMaterials.forEach((material) => material.dispose());
      disposableTextures.forEach((texture) => texture.dispose());
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
