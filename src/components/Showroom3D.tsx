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

const exploreCardPositions = [
  { x: -5.0, z: -1.6, rotY: 0.32, scale: 0.88, opacity: 0.86 },
  { x: -1.7, z: -0.4, rotY: 0.06, scale: 1.03, opacity: 0.96 },
  { x: 1.7,  z: -0.4, rotY: -0.06, scale: 1.03, opacity: 0.96 },
  { x: 5.0,  z: -1.6, rotY: -0.32, scale: 0.88, opacity: 0.86 },
];

const cardWorldPositions = [
  { x: -5.0, z: -1.6 },
  { x: -1.7, z: -0.4 },
  { x: 1.7, z: -0.4 },
  { x: 5.0, z: -1.6 },
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

type DisposableBucket = {
  materials: THREE.Material[];
  geometries: THREE.BufferGeometry[];
  textures: THREE.Texture[];
};

const createStageProps = (index: number, projectAccent: string, bucket: DisposableBucket) => {
  const group = new THREE.Group();
  group.name = `studio-set-${index}`;

  const makeMaterial = (color: string, opacity = 1, wireframe = false) => {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      wireframe,
      depthWrite: opacity >= 0.72,
    });
    material.userData.baseOpacity = opacity;
    bucket.materials.push(material);
    return material;
  };

  const makeMesh = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
  ) => {
    bucket.geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    group.add(mesh);
    return mesh;
  };

  const accentMaterial = makeMaterial(projectAccent, 0.9);
  const softMaterial = makeMaterial('#fff8df', 0.84);
  const cyanMaterial = makeMaterial('#74b9aa', 0.82);
  const lavenderMaterial = makeMaterial('#a7a6d8', 0.82);
  const lineMaterial = new THREE.LineBasicMaterial({ color: projectAccent, transparent: true, opacity: 0.54 });
  lineMaterial.userData.baseOpacity = 0.54;
  bucket.materials.push(lineMaterial);

  if (index === 0) {
    const nodes: [number, number, number][] = [
      [-1.55, 0.52, 0.22], [-1.2, 0.82, 0.2], [-0.9, 0.46, 0.24],
      [1.42, -0.46, 0.24], [1.72, -0.1, 0.2], [1.36, 0.22, 0.26],
    ];

    nodes.forEach((pos, nodeIdx) => {
      makeMesh(
        new THREE.SphereGeometry(nodeIdx % 3 === 1 ? 0.08 : 0.06, 16, 16),
        nodeIdx % 2 === 0 ? accentMaterial : cyanMaterial,
        pos,
      );
    });

    [[0, 1], [1, 2], [3, 4], [4, 5], [1, 5]].forEach(([a, b]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...nodes[a]),
        new THREE.Vector3(...nodes[b]),
      ]);
      bucket.geometries.push(geometry);
      group.add(new THREE.Line(geometry, lineMaterial));
    });
  } else if (index === 1) {
    [-0.18, 0.08, 0.34].forEach((yOffset, layerIdx) => {
      const capsule = makeMesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.78, 28),
        layerIdx === 1 ? cyanMaterial : softMaterial,
        [1.42, yOffset, 0.24],
        [1, 1, 1],
      );
      capsule.rotation.z = Math.PI / 2;
    });

    [-1.58, -1.36, -1.14].forEach((xOffset, bookIdx) => {
      const book = makeMesh(
        new THREE.BoxGeometry(0.14, 0.54, 0.08),
        bookIdx === 1 ? accentMaterial : lavenderMaterial,
        [xOffset, -0.2 + bookIdx * 0.08, 0.22],
      );
      book.rotation.z = -0.18 + bookIdx * 0.18;
    });

    const beam = makeMesh(
      new THREE.PlaneGeometry(1.22, 0.14),
      makeMaterial(projectAccent, 0.18),
      [0.14, 0.24, 0.19],
    );
    beam.rotation.z = -0.18;
  } else if (index === 2) {
    [-0.42, 0.0, 0.42].forEach((xOffset, towerIdx) => {
      const tower = makeMesh(
        new THREE.CylinderGeometry(0.13, 0.13, towerIdx === 1 ? 0.9 : 0.64, 24),
        towerIdx === 1 ? lavenderMaterial : softMaterial,
        [0.94 + xOffset, 0.06, 0.24],
      );
      tower.rotation.z = 0.04 - towerIdx * 0.04;
    });

    [-1.46, -1.12, -0.78].forEach((xOffset, blockIdx) => {
      const block = makeMesh(
        new THREE.BoxGeometry(0.28, 0.18, 0.1),
        blockIdx === 1 ? accentMaterial : cyanMaterial,
        [xOffset, -0.44, 0.22],
      );
      block.rotation.z = 0.08;
    });

    const conveyor = makeMesh(
      new THREE.BoxGeometry(1.1, 0.06, 0.05),
      makeMaterial('#6d6688', 0.36),
      [-1.1, -0.64, 0.18],
    );
    conveyor.rotation.z = 0.08;
  } else {
    const rig = makeMesh(
      new THREE.TorusGeometry(0.34, 0.018, 8, 64),
      accentMaterial,
      [-1.36, 0.18, 0.24],
    );
    rig.rotation.x = Math.PI / 2.8;
    rig.rotation.y = Math.PI / 5;

    const cube = makeMesh(
      new THREE.BoxGeometry(0.48, 0.48, 0.48),
      makeMaterial(projectAccent, 0.78, true),
      [1.34, 0.12, 0.24],
    );
    cube.rotation.set(0.54, 0.46, 0.2);

    const fountainGeometry = new THREE.BufferGeometry();
    const fountainPositions = new Float32Array(42 * 3);
    for (let i = 0; i < 42; i++) {
      fountainPositions[i * 3] = (Math.random() - 0.5) * 0.58;
      fountainPositions[i * 3 + 1] = Math.random() * 0.72 - 0.18;
      fountainPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.16 + 0.18;
    }
    fountainGeometry.setAttribute('position', new THREE.BufferAttribute(fountainPositions, 3));
    bucket.geometries.push(fountainGeometry);

    const fountainMaterial = new THREE.PointsMaterial({
      color: projectAccent,
      size: 0.05,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    fountainMaterial.userData.baseOpacity = 0.72;
    bucket.materials.push(fountainMaterial);
    const fountain = new THREE.Points(fountainGeometry, fountainMaterial);
    fountain.position.set(-0.05, -0.38, 0.22);
    group.add(fountain);
  }

  return group;
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

    const sceneObjects: THREE.Object3D[] = [
      ambientLight, sunLight, fillLight,
    ];

    const doodleSprites: THREE.Sprite[] = [];
    const doodleBaseScales: number[] = [];
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
      doodleBaseScales.push(doodle.s);
      scene.add(sprite);
      doodleSprites.push(sprite);
      sceneObjects.push(sprite);
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
        opacity: 1,
        side: THREE.FrontSide,
      });
      disposableMaterials.push(cardMat);

      const card = new THREE.Mesh(cardGeom, cardMat);
      card.position.set((i - 1.5) * 4.0, 1.1, -1.0);
      scene.add(card);
      cards.push(card);
      sceneObjects.push(card);
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
      sceneObjects.push(halo);
    }

    const stagePropGroups: THREE.Group[] = [];
    const disposableBucket: DisposableBucket = {
      materials: disposableMaterials,
      geometries: disposableGeometries,
      textures: disposableTextures,
    };

    for (let i = 0; i < PROJECT_COUNT; i++) {
      const stageProps = createStageProps(i, projects[i].accent, disposableBucket);
      stageProps.visible = true;
      scene.add(stageProps);
      stagePropGroups.push(stageProps);
      sceneObjects.push(stageProps);
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
    sceneObjects.push(particles);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredCardIdx: number | null = null;
    const mouseParallax = { x: 0, y: 0 };
    let clickedCardIdx: number | null = null;
    let clickBurstStarted = 0;

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

        clickedCardIdx = clickedIdx;
        clickBurstStarted = (performance.now() - startTime) / 1000;

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

      const hoveredWorldPosition = hoveredCardIdx !== null ? cardWorldPositions[hoveredCardIdx] : null;

      doodleSprites.forEach((sprite, idx) => {
        const hoverInfluence = hoveredWorldPosition
          ? Math.max(0, 1 - Math.abs(sprite.position.x - hoveredWorldPosition.x) / 5.5)
          : 0;
        const baseScale = doodleBaseScales[idx];
        sprite.position.y += Math.sin(time * 0.8 + idx) * 0.0009;
        sprite.material.rotation = Math.sin(time * 0.35 + idx) * 0.08;
        const nextScale = baseScale * (1 + hoverInfluence * (0.04 + Math.sin(time * 3 + idx) * 0.035));
        sprite.scale.x = THREE.MathUtils.lerp(sprite.scale.x, nextScale, 0.08);
        sprite.scale.y = THREE.MathUtils.lerp(sprite.scale.y, nextScale, 0.08);
      });

      const activeAccent = new THREE.Color(projects[curActiveProject].accent);
      fillLight.color.lerp(activeAccent, 0.035);
      sunLight.color.lerp(new THREE.Color(curViewMode === 'focus' ? projects[curActiveProject].accentSoft : '#ffc6a8'), 0.02);

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
          // Elegant arc layout with all 4 cards clearly visible
          const pos = exploreCardPositions[idx] || exploreCardPositions[0];
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
          targetOpacity = 1;
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

        const isHovered = hoveredCardIdx === idx;
        const isFocused = idx === curActiveProject && curViewMode === 'focus';
        let clickPop = 0;
        if (clickedCardIdx === idx) {
          const clickProgress = Math.min(1, Math.max(0, (time - clickBurstStarted) / 0.56));
          clickPop = Math.sin(clickProgress * Math.PI);
          if (clickProgress >= 1) {
            clickedCardIdx = null;
          }
        }

        if (isHovered) {
          targetZ += 0.18;
          targetScale += 0.04;
          targetRotY += -mouseParallax.x * 0.08;
        }

        if (clickPop > 0) {
          targetZ += clickPop * 0.36;
          targetScale += clickPop * 0.1;
          targetRotY += clickPop * 0.08;
        }

        const floatOffset = Math.sin(time * 1.1 + idx * 1.5) * 0.055;
        const finalTargetY = targetY + floatOffset;
        const targetColor = idx === curActiveProject || isHovered ? whiteColor : dimColor;
        const targetRotX = isHovered ? mouseParallax.y * -0.07 : 0;
        const targetRotZ = clickPop > 0 ? clickPop * 0.025 : 0;

        card.position.x = THREE.MathUtils.lerp(card.position.x, targetX, 0.07);
        card.position.y = THREE.MathUtils.lerp(card.position.y, finalTargetY, 0.07);
        card.position.z = THREE.MathUtils.lerp(card.position.z, targetZ, 0.07);
        card.rotation.x = THREE.MathUtils.lerp(card.rotation.x, targetRotX, 0.07);
        card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, targetRotY, 0.07);
        card.rotation.z = THREE.MathUtils.lerp(card.rotation.z, targetRotZ, 0.07);

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
          halo.rotation.x = card.rotation.x;
          halo.rotation.y = card.rotation.y;
          halo.rotation.z = card.rotation.z;

          let targetHaloOpacity = 0;
          let haloPulseScale = 1;

          if (isFocused) {
            targetHaloOpacity = 0.44;
            haloPulseScale = 1.05 + Math.sin(time * 3.5) * 0.04;
          } else if (isHovered) {
            targetHaloOpacity = 0.34;
            haloPulseScale = 1.03 + Math.sin(time * 2.0) * 0.02;
          } else if (curViewMode === 'explore') {
            targetHaloOpacity = 0.12;
            haloPulseScale = 0.98 + Math.sin(time * 1.2 + idx) * 0.015;
          }

          const targetHaloScale = targetScale * haloPulseScale;
          const nextHaloScale = THREE.MathUtils.lerp(halo.scale.x, targetHaloScale, 0.07);
          halo.scale.set(nextHaloScale, nextHaloScale, nextHaloScale);

          const hMat = halo.material as THREE.MeshBasicMaterial;
          hMat.opacity = THREE.MathUtils.lerp(hMat.opacity, targetHaloOpacity, 0.08);
        }

        const stageProps = stagePropGroups[idx];
        if (stageProps) {
          stageProps.position.x = card.position.x;
          stageProps.position.y = card.position.y;
          stageProps.position.z = card.position.z + 0.16;
          stageProps.rotation.x = card.rotation.x * 0.6;
          stageProps.rotation.y = card.rotation.y;
          stageProps.rotation.z = card.rotation.z + Math.sin(time * 0.7 + idx) * 0.018;

          const propScale = nextScale * (isFocused ? 1.1 : isHovered ? 1.04 : 0.88);
          stageProps.scale.setScalar(THREE.MathUtils.lerp(stageProps.scale.x || 1, propScale, 0.07));

          const propVisibility = isFocused ? 1 : isHovered ? 0.82 : curViewMode === 'explore' ? 0.48 : 0.2;
          stageProps.traverse((object) => {
            const material = (object as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
            if (!material) return;

            const materials = Array.isArray(material) ? material : [material];
            materials.forEach((item) => {
              if ('opacity' in item) {
                item.transparent = true;
                const baseOpacity = typeof item.userData.baseOpacity === 'number' ? item.userData.baseOpacity : 1;
                item.opacity = THREE.MathUtils.lerp(item.opacity, baseOpacity * propVisibility, 0.08);
              }
            });
          });
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

      sceneObjects.forEach((obj) => scene.remove(obj));
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
