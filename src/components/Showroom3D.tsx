import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { soundManager } from './SoundManager';

interface Showroom3DProps {
  activeProject: number;
  viewMode: 'explore' | 'focus';
  onCameraChange: (yawDegrees: number, posX: number, posZ: number) => void;
  onCardClick: (index: number) => void;
}

type CardConfig = {
  title: string;
  subtitle: string;
  tag: string;
  accent: string;
  accentSoft: string;
  chip: string;
  details: string[];
  drawArt: (ctx: CanvasRenderingContext2D) => void;
};

const projectCardConfigs: CardConfig[] = [
  {
    title: 'AI AGENTS WORKFLOW',
    subtitle: 'Multi-agent planning garden',
    tag: 'Agentic AI',
    accent: '#e98d9c',
    accentSoft: '#ffdce3',
    chip: 'Open notebook',
    details: ['Planning loops', 'Tool routers', 'Memory retrieval', 'Self-correction'],
    drawArt: (ctx) => {
      const nodes = [
        { x: 472, y: 120 }, { x: 536, y: 190 }, { x: 602, y: 138 },
        { x: 660, y: 222 }, { x: 690, y: 120 }, { x: 584, y: 258 },
      ];

      ctx.strokeStyle = 'rgba(185, 126, 145, 0.34)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 145) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.quadraticCurveTo((nodes[i].x + nodes[j].x) / 2, nodes[i].y - 18, nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node, idx) => {
        ctx.fillStyle = idx === 1 ? '#fff3c8' : idx % 2 ? '#c9e8cf' : '#ffd1da';
        ctx.strokeStyle = '#a06f7c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, idx === 1 ? 18 : 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    },
  },
  {
    title: 'HYBRID RAG DATABASE',
    subtitle: 'Semantic search meadow',
    tag: 'Semantic Search',
    accent: '#7fb7aa',
    accentSoft: '#d9f3e8',
    chip: 'Browse index',
    details: ['Hybrid search', 'Chunk windows', 'Reranking', 'Grounded answers'],
    drawArt: (ctx) => {
      ctx.strokeStyle = '#7fb7aa';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.fillStyle = '#eef9ef';

      [0, 1, 2].forEach((row) => {
        const y = 122 + row * 58;
        ctx.beginPath();
        ctx.roundRect(464, y, 204, 34, 17);
        ctx.fill();
        ctx.stroke();
      });

      ctx.fillStyle = '#f8c9d3';
      [498, 566, 634].forEach((x, idx) => {
        ctx.beginPath();
        ctx.arc(x, 246 - idx * 42, 9, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = 'rgba(127, 183, 170, 0.42)';
      ctx.beginPath();
      ctx.moveTo(500, 246);
      ctx.bezierCurveTo(548, 214, 520, 164, 566, 204);
      ctx.bezierCurveTo(606, 238, 596, 126, 634, 162);
      ctx.stroke();
    },
  },
  {
    title: 'FINE-TUNING & ML MODELS',
    subtitle: 'Training recipes and model care',
    tag: 'Deep Learning',
    accent: '#9da8d9',
    accentSoft: '#e5e7ff',
    chip: 'View recipe',
    details: ['LoRA adapters', 'Vision models', 'Quantization', 'TensorRT serving'],
    drawArt: (ctx) => {
      const layers = [
        { x: 448, y: 106, w: 72, h: 122, c: '#fff0be' },
        { x: 544, y: 84, w: 82, h: 166, c: '#e5e7ff' },
        { x: 650, y: 116, w: 64, h: 104, c: '#d8f0dd' },
      ];

      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      layers.forEach((layer) => {
        ctx.fillStyle = layer.c;
        ctx.strokeStyle = '#8a86a6';
        ctx.beginPath();
        ctx.roundRect(layer.x, layer.y, layer.w, layer.h, 22);
        ctx.fill();
        ctx.stroke();
      });

      ctx.strokeStyle = 'rgba(138, 134, 166, 0.42)';
      ctx.beginPath();
      ctx.moveTo(520, 166);
      ctx.lineTo(544, 166);
      ctx.moveTo(626, 166);
      ctx.lineTo(650, 166);
      ctx.stroke();

      ctx.fillStyle = '#6e688a';
      ctx.font = '700 18px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LoRA', 585, 158);
      ctx.fillText('FP16', 585, 188);
      ctx.textAlign = 'left';
    },
  },
  {
    title: 'WEBGL 3D INTERACTIVES',
    subtitle: 'Soft motion and creative coding',
    tag: 'Creative Coding',
    accent: '#f1a86f',
    accentSoft: '#ffe2bf',
    chip: 'Play scene',
    details: ['Three.js scenes', 'GLSL shaders', 'Canvas tools', 'Particle systems'],
    drawArt: (ctx) => {
      ctx.strokeStyle = '#f1a86f';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.ellipse(584, 170, 108, 38, Math.PI / 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(584, 170, 108, 38, -Math.PI / 7, 0, Math.PI * 2);
      ctx.stroke();

      [
        { x: 500, y: 122, r: 11, c: '#ffd1da' },
        { x: 668, y: 218, r: 13, c: '#fff0be' },
        { x: 510, y: 218, r: 9, c: '#d9f3e8' },
        { x: 660, y: 120, r: 10, c: '#e5e7ff' },
        { x: 584, y: 170, r: 16, c: '#ffffff' },
      ].forEach((p) => {
        ctx.fillStyle = p.c;
        ctx.strokeStyle = '#a87466';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    },
  },
];

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
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const disposableMaterials: THREE.Material[] = [];
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableTextures: THREE.Texture[] = [];

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffdfd2);
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

    const createSkyTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 96;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#b9c9f6');
      gradient.addColorStop(0.38, '#f7cdd6');
      gradient.addColorStop(0.72, '#ffe0c3');
      gradient.addColorStop(1, '#fff6dd');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      disposableTextures.push(texture);
      return texture;
    };
    scene.background = createSkyTexture();

    const floorGeo = new THREE.PlaneGeometry(42, 42);
    disposableGeometries.push(floorGeo);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xfff0d7,
      roughness: 0.72,
      metalness: 0.02,
    });
    disposableMaterials.push(floorMat);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    const pathGeo = new THREE.PlaneGeometry(28, 7);
    disposableGeometries.push(pathGeo);
    const pathTextureCanvas = document.createElement('canvas');
    pathTextureCanvas.width = 1024;
    pathTextureCanvas.height = 256;
    const pathCtx = pathTextureCanvas.getContext('2d')!;
    pathCtx.clearRect(0, 0, 1024, 256);
    pathCtx.strokeStyle = 'rgba(242, 171, 165, 0.72)';
    pathCtx.lineWidth = 44;
    pathCtx.lineCap = 'round';
    pathCtx.beginPath();
    pathCtx.moveTo(48, 212);
    pathCtx.bezierCurveTo(260, 82, 386, 296, 554, 130);
    pathCtx.bezierCurveTo(716, -30, 824, 186, 982, 68);
    pathCtx.stroke();
    pathCtx.strokeStyle = 'rgba(255, 252, 232, 0.78)';
    pathCtx.lineWidth = 10;
    pathCtx.stroke();
    const pathTexture = new THREE.CanvasTexture(pathTextureCanvas);
    pathTexture.colorSpace = THREE.SRGBColorSpace;
    disposableTextures.push(pathTexture);
    const pathMat = new THREE.MeshBasicMaterial({ map: pathTexture, transparent: true, opacity: 0.8 });
    disposableMaterials.push(pathMat);
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.018, -3.2);
    scene.add(path);

    const createBackdropTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 640;
      const ctx = canvas.getContext('2d')!;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#bfcdf7');
      gradient.addColorStop(0.46, '#ffd0d8');
      gradient.addColorStop(1, '#fff3ce');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fff1b8';
      ctx.beginPath();
      ctx.arc(720, 368, 78, 0, Math.PI * 2);
      ctx.fill();

      const drawCloud = (x: number, y: number, scale: number) => {
        ctx.fillStyle = 'rgba(255, 246, 233, 0.82)';
        [0, 46, 96, 142].forEach((dx, idx) => {
          ctx.beginPath();
          ctx.arc(x + dx * scale, y + (idx % 2) * 12 * scale, (46 + idx * 6) * scale, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      drawCloud(48, 308, 1.2);
      drawCloud(1030, 290, 1.08);
      drawCloud(892, 182, 0.58);

      ctx.fillStyle = '#d9d8b7';
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.bezierCurveTo(210, 340, 328, 430, 496, 350);
      ctx.bezierCurveTo(660, 276, 782, 404, 944, 344);
      ctx.bezierCurveTo(1112, 278, 1210, 400, 1400, 310);
      ctx.lineTo(1400, 640);
      ctx.lineTo(0, 640);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#b9d6be';
      ctx.beginPath();
      ctx.moveTo(0, 528);
      ctx.bezierCurveTo(190, 420, 340, 520, 548, 430);
      ctx.bezierCurveTo(722, 356, 874, 516, 1044, 428);
      ctx.bezierCurveTo(1200, 350, 1302, 470, 1400, 408);
      ctx.lineTo(1400, 640);
      ctx.lineTo(0, 640);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f2aaa9';
      ctx.beginPath();
      ctx.roundRect(122, 406, 42, 62, 8);
      ctx.roundRect(176, 372, 52, 96, 8);
      ctx.roundRect(244, 426, 40, 42, 7);
      ctx.fill();
      ctx.fillStyle = '#f6d3a1';
      ctx.fillRect(134, 424, 10, 12);
      ctx.fillRect(192, 392, 10, 12);
      ctx.fillRect(260, 440, 10, 12);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      disposableTextures.push(texture);
      return texture;
    };

    const backdropGeo = new THREE.PlaneGeometry(32, 14.6);
    disposableGeometries.push(backdropGeo);
    const backdropMat = new THREE.MeshBasicMaterial({ map: createBackdropTexture(), transparent: true });
    disposableMaterials.push(backdropMat);
    const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
    backdrop.position.set(0, 6.0, -10.4);
    scene.add(backdrop);

    const createDoodleTexture = (kind: 'star' | 'heart' | 'cloud', color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d')!;
      ctx.lineWidth = 7;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(128, 93, 100, 0.45)';
      ctx.fillStyle = color;

      if (kind === 'star') {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? 54 : 24;
          const angle = -Math.PI / 2 + (i * Math.PI) / 5;
          const x = 80 + Math.cos(angle) * radius;
          const y = 80 + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (kind === 'heart') {
        ctx.beginPath();
        ctx.moveTo(80, 124);
        ctx.bezierCurveTo(20, 78, 30, 30, 70, 44);
        ctx.bezierCurveTo(80, 18, 130, 32, 126, 72);
        ctx.bezierCurveTo(122, 96, 104, 108, 80, 124);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(55, 88, 28, Math.PI, 0);
        ctx.arc(82, 72, 35, Math.PI, 0);
        ctx.arc(116, 90, 24, Math.PI, 0);
        ctx.lineTo(140, 108);
        ctx.lineTo(30, 108);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      disposableTextures.push(texture);
      return texture;
    };

    const doodles = [
      { kind: 'star' as const, color: '#fff0a8', x: -5.8, y: 4.2, z: -5.8, s: 0.74 },
      { kind: 'heart' as const, color: '#ffc4ce', x: -2.9, y: 4.9, z: -6.8, s: 0.52 },
      { kind: 'cloud' as const, color: '#fff7ea', x: 0.1, y: 3.9, z: -7.2, s: 1.0 },
      { kind: 'star' as const, color: '#ffe5a4', x: 3.2, y: 4.7, z: -6.4, s: 0.54 },
      { kind: 'heart' as const, color: '#f8b7c4', x: 6.2, y: 4.1, z: -6.0, s: 0.46 },
    ];

    const doodleSprites: THREE.Sprite[] = [];
    doodles.forEach((doodle) => {
      const material = new THREE.SpriteMaterial({
        map: createDoodleTexture(doodle.kind, doodle.color),
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

    const drawRoundedRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
    ) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    };

    const createRichCardTexture = (index: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 768;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      const config = projectCardConfigs[index];

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#fffaf0');
      gradient.addColorStop(0.45, config.accentSoft);
      gradient.addColorStop(1, '#ddecf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      for (let i = 0; i < 18; i++) {
        const x = (i * 67 + index * 31) % canvas.width;
        const y = 36 + ((i * 43) % 420);
        ctx.beginPath();
        ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(134, 99, 105, 0.25)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 16]);
      ctx.beginPath();
      ctx.moveTo(396, 82);
      ctx.bezierCurveTo(490, 12, 558, 92, 650, 54);
      ctx.bezierCurveTo(700, 36, 728, 78, 708, 124);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
      ctx.strokeStyle = 'rgba(128, 93, 100, 0.18)';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, 28, 28, canvas.width - 56, canvas.height - 56, 36);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = config.accentSoft;
      ctx.strokeStyle = config.accent;
      ctx.lineWidth = 3;
      drawRoundedRect(ctx, 48, 48, 142, 32, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#665260';
      ctx.font = '800 15px "Nunito", sans-serif';
      ctx.fillText(config.tag.toUpperCase(), 64, 69);

      ctx.fillStyle = '#4f465b';
      ctx.font = '900 35px "Nunito", sans-serif';
      const titleWords = config.title.split(' ');
      const firstLine = titleWords.slice(0, 2).join(' ');
      const secondLine = titleWords.slice(2).join(' ');
      ctx.fillText(firstLine, 50, 126);
      if (secondLine) ctx.fillText(secondLine, 50, 166);

      ctx.fillStyle = '#7a7184';
      ctx.font = '700 18px "Nunito", sans-serif';
      ctx.fillText(config.subtitle, 52, 204);

      ctx.font = '700 17px "Nunito", sans-serif';
      config.details.forEach((detail, i) => {
        const y = 252 + i * 34;
        ctx.fillStyle = ['#ffd1da', '#d8f0dd', '#fff0be', '#e5e7ff'][i];
        ctx.strokeStyle = 'rgba(128, 93, 100, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(62, y - 5, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#62596d';
        ctx.fillText(detail, 84, y);
      });

      config.drawArt(ctx);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = config.accent;
      ctx.lineWidth = 3;
      drawRoundedRect(ctx, 50, 402, 212, 48, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#51475c';
      ctx.font = '900 16px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.chip, 156, 426);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      ctx.fillStyle = config.accent;
      ctx.beginPath();
      ctx.arc(688, 410, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fffaf0';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? 18 : 8;
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const x = 688 + Math.cos(angle) * radius;
        const y = 410 + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const cardGeom = new THREE.BoxGeometry(3.5, 2.3, 0.06);
    disposableGeometries.push(cardGeom);
    const cards: THREE.Mesh[] = [];

    for (let i = 0; i < 4; i++) {
      const richTex = createRichCardTexture(i);
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
          soundManager.playHover();
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

        soundManager.playClick();
        onCardClick(clickedIdx);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const startTime = performance.now();
    let animationFrameId: number;

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

        if (curViewMode === 'explore') {
          targetX = (idx - 1.5) * 3.4;
          targetZ = -Math.abs(targetX) * 0.18 - 1.5;
          targetRotY = -targetX * 0.08;
          targetScale = 1.0;
        } else if (offset === 0) {
          targetX = -0.55;
          targetZ = 1.25;
          targetRotY = -0.05;
          targetScale = 1.15;
        } else if (offset === -1 || offset === 3) {
          targetX = -3.5;
          targetZ = -0.3;
          targetRotY = 0.52;
          targetScale = 0.82;
        } else if (offset === 1 || offset === -3) {
          targetX = 2.4;
          targetZ = -0.3;
          targetRotY = -0.52;
          targetScale = 0.82;
        } else {
          targetX = offset < 0 ? -4.5 : 4.5;
          targetZ = -2.2;
          targetRotY = offset < 0 ? 0.6 : -0.6;
          targetScale = 0.55;
        }

        const floatOffset = Math.sin(time * 1.1 + idx * 1.5) * 0.055;
        const finalTargetY = targetY + floatOffset;
        const targetColorVal = idx === curActiveProject || hoveredCardIdx === idx ? 0xffffff : 0xd7d3e8;

        card.position.x = THREE.MathUtils.lerp(card.position.x, targetX, 0.07);
        card.position.y = THREE.MathUtils.lerp(card.position.y, finalTargetY, 0.07);
        card.position.z = THREE.MathUtils.lerp(card.position.z, targetZ, 0.07);
        card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, targetRotY, 0.07);

        const nextScale = THREE.MathUtils.lerp(card.scale.x, targetScale, 0.07);
        card.scale.set(nextScale, nextScale, nextScale);

        const mat = card.material as THREE.MeshBasicMaterial;
        mat.color.lerp(new THREE.Color(targetColorVal), 0.08);
      });

      if (curViewMode === 'explore') {
        const targetX = Math.sin(time * 0.08) * 1.0 + mouseParallax.x * 0.5;
        const targetY = 2.1 + Math.cos(time * 0.08) * 0.15 + mouseParallax.y * 0.25;
        const targetZ = 6.4 + Math.sin(time * 0.04) * 0.3;

        targetCamPos.set(targetX, targetY, targetZ);
        targetLookAt.set(0, 1.1, -1);
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
