export const PROJECT_COUNT = 4;

export interface Project {
  cardTitle: string;
  subtitle: string;
  tag: string;
  accent: string;
  accentSoft: string;
  chip: string;
  details: string[];
  drawArt: (ctx: CanvasRenderingContext2D) => void;
  title: string;
  desc: string;
  tech: string[];
  metrics: { label: string; value: string }[];
  abbr: string;
  swatch: string;
  carouselShape: 'square' | 'circle';
  radarX: number;
  radarZ: number;
}

export const projects: Project[] = [
  {
    cardTitle: 'AI AGENTS WORKFLOW',
    subtitle: 'Multi-agent planning garden',
    tag: 'AGENTIC AI',
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
    title: 'AI AGENT WORKFLOWS',
    desc: 'Autonomous workflow system using multi-agent architectures. Operates with tool usage, memory retrieval loops, and self-correcting planning strategies. Integrated with LangChain, LangGraph, and proprietary tool call routers.',
    tech: ["LangGraph", "OpenAI API", "Python", "Tool Call Routers", "Vector DB"],
    metrics: [
      { label: "AUTONOMY RATE", value: "98.2%" },
      { label: "AVG PLAN TIME", value: "450ms" },
      { label: "TOOL RUNNERS", value: "24 Active" },
      { label: "LLM CHASSIS", value: "GPT-4o/Claude" }
    ],
    abbr: "AGENT",
    swatch: '#e98d9c',
    carouselShape: 'square',
    radarX: -3.2,
    radarZ: -1.0,
  },
  {
    cardTitle: 'HYBRID RAG DATABASE',
    subtitle: 'Semantic search meadow',
    tag: 'SEMANTIC SEARCH',
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
    title: 'ENTERPRISE RAG ARCHITECTURE',
    desc: 'Production-grade Retrieval-Augmented Generation system. Employs advanced document ingestion, custom chunk hierarchies, dynamic sliding windows, hybrid keyword/vector search, and Cohere semantic reranking for precise LLM grounding.',
    tech: ["Qdrant", "Pinecone", "LlamaIndex", "Cohere Rerank", "FastAPI"],
    metrics: [
      { label: "RETRIEVAL ACC", value: "94.6%" },
      { label: "QUERY LATENCY", value: "115ms" },
      { label: "DOCUMENTS INDEXED", value: "2.5M+" },
      { label: "EMBEDDING DIM", value: "1536 (Ada)" }
    ],
    abbr: "RAG",
    swatch: '#74b9aa',
    carouselShape: 'circle',
    radarX: -1.1,
    radarZ: -2.0,
  },
  {
    cardTitle: 'FINE-TUNING & ML MODELS',
    subtitle: 'Training recipes and model care',
    tag: 'DEEP LEARNING',
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
    title: 'FINE-TUNING & ML MODELS',
    desc: 'Custom training workflows for LLMs and specialized vision models. Deep expertise in Parameter-Efficient Fine-Tuning (PEFT, LoRA/QLoRA), deep reinforcement learning (RLHF/DPO), vision segmentations, and high-performance ONNX/TensorRT deployments.',
    tech: ["PyTorch", "HuggingFace", "LoRA / PEFT", "TensorRT", "DeepSpeed"],
    metrics: [
      { label: "MODEL SIZE", value: "7B / 8B / 70B" },
      { label: "TRAINING LOSS", value: "0.85" },
      { label: "FP16 INFERENCE", value: "48 tok/s" },
      { label: "QUANTIZATION", value: "INT4/INT8" }
    ],
    abbr: "MODELS",
    swatch: '#a7a6d8',
    carouselShape: 'square',
    radarX: 1.1,
    radarZ: -2.0,
  },
  {
    cardTitle: 'WEBGL 3D INTERACTIVES',
    subtitle: 'Soft motion and creative coding',
    tag: 'CREATIVE CODING',
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
    title: 'WEBGL 3D INTERACTIVES',
    desc: 'Interactive 3D graphics interfaces and hardware-accelerated shaders. Deep integration of custom Three.js pipelines, custom GLSL vertex/fragment shaders, high-performance particle engine systems, and physics engine bindings.',
    tech: ["Three.js", "GLSL Shaders", "WebGL 2", "HTML5 Canvas", "GSAP Tween"],
    metrics: [
      { label: "GPU DRAW CALLS", value: "34/frame" },
      { label: "TARGET RATE", value: "60 FPS" },
      { label: "PARTICLES RUNNING", value: "50,000+" },
      { label: "SHADER PROFILES", value: "GLSL ES 3.0" }
    ],
    abbr: "WEBGL",
    swatch: '#f5cf77',
    carouselShape: 'square',
    radarX: 3.2,
    radarZ: -1.0,
  },
];
