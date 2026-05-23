import React, { useState, useEffect } from 'react';
import { soundManager } from './SoundManager';

interface HUDOverlayProps {
  activeProject: number;
  viewMode: 'explore' | 'focus';
  cameraYaw: number;
  cameraPos: { x: number; z: number };
  onSelectProject: (index: number) => void;
  onToggleViewMode: () => void;
  onNavClick: (section: string) => void;
}

// Tech details for the 4 project blocks
const projectDetails = [
  {
    title: "AI AGENT WORKFLOWS",
    tag: "AGENTIC AI",
    desc: "Autonomous workflow system using multi-agent architectures. Operates with tool usage, memory retrieval loops, and self-correcting planning strategies. Integrated with LangChain, LangGraph, and proprietary tool call routers.",
    tech: ["LangGraph", "OpenAI API", "Python", "Tool Call Routers", "Vector DB"],
    metrics: [
      { label: "AUTONOMY RATE", value: "98.2%" },
      { label: "AVG PLAN TIME", value: "450ms" },
      { label: "TOOL RUNNERS", value: "24 Active" },
      { label: "LLM CHASSIS", value: "GPT-4o/Claude" }
    ],
    architecture: `<svg viewBox="0 0 320 120" width="100%" height="100%">
      <rect x="10" y="35" width="70" height="40" rx="3" fill="none" stroke="#00e5ff" stroke-width="1" stroke-dasharray="2"/>
      <text x="45" y="60" fill="#00e5ff" font-size="8" font-family="Orbitron" text-anchor="middle">USER IN</text>
      <path d="M 80 55 L 110 55" fill="none" stroke="#ff007f" stroke-width="1.5"/>
      <polygon points="110,55 104,51 104,59" fill="#ff007f"/>
      <rect x="110" y="20" width="100" height="70" rx="4" fill="rgba(0, 229, 255, 0.05)" stroke="#00e5ff" stroke-width="1.5"/>
      <text x="160" y="45" fill="#fff" font-size="9" font-family="Orbitron" font-weight="bold" text-anchor="middle">AGENT CORE</text>
      <text x="160" y="62" fill="#00e5ff" font-size="7" font-family="Orbitron" text-anchor="middle">PLANNING & MEM</text>
      <text x="160" y="75" fill="#ff007f" font-size="7" font-family="Orbitron" text-anchor="middle">TOOL EXECUTOR</text>
      <path d="M 210 40 L 240 40" fill="none" stroke="#00e5ff" stroke-width="1"/>
      <polygon points="240,40 234,37 234,43" fill="#00e5ff"/>
      <path d="M 210 70 L 240 70" fill="none" stroke="#00e5ff" stroke-width="1"/>
      <polygon points="240,70 234,67 234,73" fill="#00e5ff"/>
      <rect x="240" y="25" width="70" height="30" rx="3" fill="none" stroke="#ff007f" stroke-width="1"/>
      <text x="275" y="44" fill="#ff007f" font-size="7" font-family="Orbitron" text-anchor="middle">TOOLS API</text>
      <rect x="240" y="65" width="70" height="30" rx="3" fill="none" stroke="#00e5ff" stroke-width="1"/>
      <text x="275" y="84" fill="#00e5ff" font-size="7" font-family="Orbitron" text-anchor="middle">VECTOR DB</text>
    </svg>`
  },
  {
    title: "ENTERPRISE RAG ARCHITECTURE",
    tag: "SEMANTIC SEARCH",
    desc: "Production-grade Retrieval-Augmented Generation system. Employs advanced document ingestion, custom chunk hierarchies, dynamic sliding windows, hybrid keyword/vector search, and Cohere semantic reranking for precise LLM grounding.",
    tech: ["Qdrant", "Pinecone", "LlamaIndex", "Cohere Rerank", "FastAPI"],
    metrics: [
      { label: "RETRIEVAL ACC", value: "94.6%" },
      { label: "QUERY LATENCY", value: "115ms" },
      { label: "DOCUMENTS INDEXED", value: "2.5M+" },
      { label: "EMBEDDING DIM", value: "1536 (Ada)" }
    ],
    architecture: `<svg viewBox="0 0 320 120" width="100%" height="100%">
      <rect x="10" y="20" width="80" height="30" rx="3" fill="none" stroke="#00e5ff" stroke-width="1"/>
      <text x="50" y="38" fill="#00e5ff" font-size="7" font-family="Orbitron" text-anchor="middle">DOC INGEST</text>
      <path d="M 90 35 L 120 35" fill="none" stroke="#00e5ff" stroke-width="1"/>
      <polygon points="120,35 114,32 114,38" fill="#00e5ff"/>
      <rect x="120" y="20" width="80" height="35" rx="3" fill="rgba(255, 0, 127, 0.05)" stroke="#ff007f" stroke-width="1.5"/>
      <text x="160" y="38" fill="#ff007f" font-size="8" font-family="Orbitron" font-weight="bold" text-anchor="middle">HYBRID SEARCH</text>
      <text x="160" y="48" fill="#fff" font-size="6" font-family="Orbitron" text-anchor="middle">VECTOR + KEYWORD</text>
      <path d="M 160 55 L 160 75" fill="none" stroke="#ff007f" stroke-width="1"/>
      <polygon points="160,75 157,69 163,69" fill="#ff007f"/>
      <rect x="120" y="75" width="80" height="30" rx="3" fill="none" stroke="#00e5ff" stroke-width="1"/>
      <text x="160" y="93" fill="#00e5ff" font-size="7" font-family="Orbitron" text-anchor="middle">SEMANTIC RERANK</text>
      <path d="M 200 90 L 230 90" fill="none" stroke="#00e5ff" stroke-width="1"/>
      <polygon points="230,90 224,87 224,93" fill="#00e5ff"/>
      <rect x="230" y="70" width="80" height="38" rx="3" fill="none" stroke="#ff007f" stroke-width="1" stroke-dasharray="2"/>
      <text x="270" y="88" fill="#ff007f" font-size="8" font-family="Orbitron" text-anchor="middle">LLM CONTEXT</text>
      <text x="270" y="98" fill="#fff" font-size="6" font-family="Orbitron" text-anchor="middle">GROUNDED ANSWER</text>
    </svg>`
  },
  {
    title: "FINE-TUNING & ML MODELS",
    tag: "DEEP LEARNING",
    desc: "Custom training workflows for LLMs and specialized vision models. Deep expertise in Parameter-Efficient Fine-Tuning (PEFT, LoRA/QLoRA), deep reinforcement learning (RLHF/DPO), vision segmentations, and high-performance ONNX/TensorRT deployments.",
    tech: ["PyTorch", "HuggingFace", "LoRA / PEFT", "TensorRT", "DeepSpeed"],
    metrics: [
      { label: "MODEL SIZE", value: "7B / 8B / 70B" },
      { label: "TRAINING LOSS", value: "0.85" },
      { label: "FP16 INFERENCE", value: "48 tok/s" },
      { label: "QUANTIZATION", value: "INT4/INT8" }
    ],
    architecture: `<svg viewBox="0 0 320 120" width="100%" height="100%">
      <rect x="15" y="30" width="70" height="50" rx="4" fill="none" stroke="#00e5ff" stroke-width="1"/>
      <text x="50" y="50" fill="#fff" font-size="8" font-family="Orbitron" font-weight="bold" text-anchor="middle">BASE MODEL</text>
      <text x="50" y="65" fill="#00e5ff" font-size="7" font-family="Orbitron" text-anchor="middle">Llama-3 / Mistral</text>
      <path d="M 85 55 L 115 55" fill="none" stroke="#00e5ff" stroke-width="1.5"/>
      <polygon points="115,55 109,51 109,59" fill="#00e5ff"/>
      <rect x="115" y="20" width="90" height="70" rx="4" fill="rgba(255, 0, 127, 0.05)" stroke="#ff007f" stroke-width="1.5"/>
      <text x="160" y="45" fill="#ff007f" font-size="9" font-family="Orbitron" font-weight="bold" text-anchor="middle">QLoRA / PEFT</text>
      <text x="160" y="60" fill="#fff" font-size="7" font-family="Orbitron" text-anchor="middle">ADAPTER WEIGHTS</text>
      <text x="160" y="75" fill="#00e5ff" font-size="7" font-family="Orbitron" text-anchor="middle">16-bit Quantize</text>
      <path d="M 205 55 L 235 55" fill="none" stroke="#ff007f" stroke-width="1.5"/>
      <polygon points="235,55 229,51 229,59" fill="#ff007f"/>
      <rect x="235" y="30" width="70" height="50" rx="4" fill="none" stroke="#00e5ff" stroke-width="1" stroke-dasharray="2"/>
      <text x="270" y="55" fill="#00e5ff" font-size="8" font-family="Orbitron" text-anchor="middle">DEPLOYED</text>
      <text x="270" y="68" fill="#fff" font-size="7" font-family="Orbitron" text-anchor="middle">TensorRT Engine</text>
    </svg>`
  },
  {
    title: "WEBGL 3D INTERACTIVES",
    tag: "CREATIVE CODING",
    desc: "Interactive 3D graphics interfaces and hardware-accelerated shaders. Deep integration of custom Three.js pipelines, custom GLSL vertex/fragment shaders, high-performance particle engine systems, and physics engine bindings.",
    tech: ["Three.js", "GLSL Shaders", "WebGL 2", "HTML5 Canvas", "GSAP Tween"],
    metrics: [
      { label: "GPU DRAW CALLS", value: "34/frame" },
      { label: "TARGET RATE", value: "60 FPS" },
      { label: "PARTICLES RUNNING", value: "50,000+" },
      { label: "SHADER PROFILES", value: "GLSL ES 3.0" }
    ],
    architecture: `<svg viewBox="0 0 320 120" width="100%" height="100%">
      <circle cx="50" cy="60" r="25" fill="none" stroke="#00e5ff" stroke-width="1.5"/>
      <text x="50" y="63" fill="#00e5ff" font-size="8" font-family="Orbitron" text-anchor="middle">3D SCENE</text>
      <path d="M 75 60 L 105 60" fill="none" stroke="#00e5ff" stroke-width="1"/>
      <polygon points="105,60 99,57 99,63" fill="#00e5ff"/>
      <rect x="105" y="25" width="110" height="70" rx="4" fill="rgba(255, 0, 127, 0.05)" stroke="#ff007f" stroke-width="1.5"/>
      <text x="160" y="45" fill="#ff007f" font-size="9" font-family="Orbitron" font-weight="bold" text-anchor="middle">GPU SHADERS</text>
      <text x="160" y="60" fill="#fff" font-size="7" font-family="Orbitron" text-anchor="middle">Vertex / Frag GLSL</text>
      <text x="160" y="75" fill="#00e5ff" font-size="7" font-family="Orbitron" text-anchor="middle">Reflection Maps</text>
      <path d="M 215 60 L 245 60" fill="none" stroke="#ff007f" stroke-width="1"/>
      <polygon points="245,60 239,57 239,63" fill="#ff007f"/>
      <rect x="245" y="35" width="60" height="50" rx="3" fill="none" stroke="#00e5ff" stroke-width="1" stroke-dasharray="2"/>
      <text x="275" y="58" fill="#00e5ff" font-size="8" font-family="Orbitron" text-anchor="middle">RENDER</text>
      <text x="275" y="70" fill="#fff" font-size="7" font-family="Orbitron" text-anchor="middle">WebGL Canvas</text>
    </svg>`
  }
];

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  activeProject,
  viewMode,
  cameraYaw,
  cameraPos,
  onSelectProject,
  onToggleViewMode,
  onNavClick,
}) => {
  const [soundActive, setSoundActive] = useState(false);
  const [activeSection, setActiveSection] = useState("EXPLORE");
  const [showModal, setShowModal] = useState<'about' | 'contact' | null>(null);

  // Sync active section based on camera viewMode and projects
  useEffect(() => {
    if (viewMode === 'focus') {
      setActiveSection("PROJECTS");
    } else {
      setActiveSection("EXPLORE");
    }
  }, [viewMode]);

  // Handle sound button click
  const handleSoundToggle = () => {
    soundManager.playClick();
    if (soundActive) {
      soundManager.stopAmbient();
      setSoundActive(false);
    } else {
      soundManager.startAmbient();
      setSoundActive(true);
    }
  };

  // Nav Item click
  const handleNavClick = (section: string) => {
    soundManager.playClick();
    setActiveSection(section);
    
    if (section === 'ABOUT') {
      setShowModal('about');
      onNavClick('ABOUT');
    } else if (section === 'CONTACT') {
      setShowModal('contact');
      onNavClick('CONTACT');
    } else if (section === 'EXPLORE') {
      if (viewMode === 'focus') {
        onToggleViewMode(); // Go back to explore mode
      }
      onNavClick('EXPLORE');
    } else if (section === 'PROJECTS') {
      if (viewMode === 'explore') {
        onToggleViewMode(); // Go to focus mode
      }
      onNavClick('PROJECTS');
    }
  };

  const handleArrowNav = (direction: 'prev' | 'next') => {
    soundManager.playClick();
    let newIdx = activeProject;
    if (direction === 'prev') {
      newIdx = (activeProject - 1 + 4) % 4;
    } else {
      newIdx = (activeProject + 1) % 4;
    }
    
    // Auto switch to focus mode if navigating cards
    if (viewMode === 'explore') {
      onToggleViewMode();
    }
    onSelectProject(newIdx);
  };

  const handleThumbnailClick = (index: number) => {
    soundManager.playClick();
    if (viewMode === 'explore') {
      onToggleViewMode();
    }
    onSelectProject(index);
  };

  // Close modals
  const closeModal = () => {
    soundManager.playClick();
    setShowModal(null);
    setActiveSection(viewMode === 'focus' ? 'PROJECTS' : 'EXPLORE');
  };

  // --- 1. COORDINATE MAPPER FOR RADAR ---
  // Camera bounds roughly range within [-6, 6] in x and [-8, 8] in z
  const radarDotX = 50 + (cameraPos.x / 14) * 50; 
  const radarDotZ = 50 + (cameraPos.z / 14) * 50;

  // Project locations mapped to radar coordinates
  // AI AGENT: x=-3.2, z=-1.0
  // RAG: x=-1.1, z=-2.0
  // ML: x=1.1, z=-2.0
  // WEBGL: x=3.2, z=-1.0
  const radarProjectPositions = [
    { x: 50 + (-3.2 / 14) * 50, z: 50 + (-1.0 / 14) * 50 },
    { x: 50 + (-1.1 / 14) * 50, z: 50 + (-2.0 / 14) * 50 },
    { x: 50 + (1.1 / 14) * 50, z: 50 + (-2.0 / 14) * 50 },
    { x: 50 + (3.2 / 14) * 50, z: 50 + (-1.0 / 14) * 50 }
  ];

  // --- 2. GENERATE COMPASS TICKS ---
  // Spacing between ticks is 40px for every 15 degrees.
  // We generate a scale from -180 to 540 degrees so the slider handles wraparound smoothly.
  const compassScaleWidth = 40; // width in px per 15 degrees
  const compassTicks: number[] = [];
  for (let i = -180; i <= 540; i += 15) {
    compassTicks.push(i);
  }

  // Bind sliding offset to cameraYaw: center point represents current yaw
  const compassOffset = -(cameraYaw * (compassScaleWidth / 15));

  const getCardinalLabel = (angle: number) => {
    // Normalise to [0, 360)
    let norm = angle % 360;
    if (norm < 0) norm += 360;

    switch (norm) {
      case 0: return "N";
      case 45: return "NE";
      case 90: return "E";
      case 135: return "SE";
      case 180: return "S";
      case 225: return "SW";
      case 270: return "W";
      case 315: return "NW";
      default: return norm.toString();
    }
  };

  const isCardinal = (angle: number) => {
    let norm = angle % 360;
    if (norm < 0) norm += 360;
    return [0, 45, 90, 135, 180, 225, 270, 315].includes(norm);
  };

  return (
    <>
      <div className="hud-container">
        {/* Sleek corner overlays */}
        <div className="hud-corner hud-corner-tl"></div>
        <div className="hud-corner hud-corner-tr"></div>
        <div className="hud-corner hud-corner-bl"></div>
        <div className="hud-corner hud-corner-br"></div>

        <div className="hud-crosshair-left">+</div>
        <div className="hud-crosshair-right">+</div>

        {/* --- HEADER --- */}
        <header className="hud-header">
          <div className="brand-section">
            <h1 className="main-title">MINH TRUONG</h1>
            <div className="title-line"></div>
            <p className="subtitle">
              Building the future with AI Agents, RAG, and innovative technologies.
            </p>
          </div>

          <nav className="nav-menu interactive">
            <div 
              className={`nav-item ${activeSection === 'EXPLORE' ? 'active' : ''}`}
              onClick={() => handleNavClick('EXPLORE')}
            >
              EXPLORE
            </div>
            <div 
              className={`nav-item ${activeSection === 'PROJECTS' ? 'active' : ''}`}
              onClick={() => handleNavClick('PROJECTS')}
            >
              PROJECTS
            </div>
            <div 
              className={`nav-item ${activeSection === 'ABOUT' ? 'active' : ''}`}
              onClick={() => handleNavClick('ABOUT')}
            >
              ABOUT
            </div>
            <div 
              className={`nav-item ${activeSection === 'CONTACT' ? 'active' : ''}`}
              onClick={() => handleNavClick('CONTACT')}
            >
              CONTACT
            </div>

            <button className="btn-showroom" onClick={onToggleViewMode}>
              {viewMode === 'explore' ? 'View 3D Showroom' : 'Panoramic Mode'}
            </button>
          </nav>

          <div 
            className={`sound-control interactive ${soundActive ? 'active' : ''}`}
            onClick={handleSoundToggle}
          >
            <span>SOUND {soundActive ? 'ON' : 'OFF'}</span>
            <div className="sound-wave">
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
            </div>
          </div>
        </header>

        {/* --- BOTTOM ROW HUD --- */}
        <footer className="hud-bottom">
          
          {/* Bottom-Left: SVG Radar mini-map */}
          <div className="radar-panel cyber-panel interactive">
            <div className="radar-display">
              <div className="radar-circle radar-circle-1"></div>
              <div className="radar-circle radar-circle-2"></div>
              <div className="radar-circle radar-circle-3"></div>
              <div className="radar-crosshair-h"></div>
              <div className="radar-crosshair-v"></div>
              
              {/* Spinning radar sweep */}
              <div className="radar-sweep"></div>
              
              {/* Project positions static markers */}
              {radarProjectPositions.map((pos, idx) => (
                <div 
                  key={idx}
                  className="radar-project-dot"
                  style={{ 
                    left: `${pos.x}%`, 
                    top: `${pos.z}%`,
                    backgroundColor: idx === activeProject && viewMode === 'focus' ? '#ff007f' : '#00e5ff',
                    boxShadow: idx === activeProject && viewMode === 'focus' ? '0 0 8px #ff007f' : '0 0 6px #00e5ff'
                  }}
                  title={projectDetails[idx].title}
                ></div>
              ))}

              {/* Blinking user location dot */}
              <div 
                className="radar-dot" 
                style={{ 
                  left: `${radarDotX}%`, 
                  top: `${radarDotZ}%` 
                }}
              ></div>

              <div className="radar-label">MAP POSITION</div>
            </div>
          </div>

          {/* Bottom-Center: Compass slider */}
          <div className="compass-panel cyber-panel">
            <div className="compass-pointer-top">▼</div>
            <div className="compass-container">
              <div 
                className="compass-scale"
                style={{ transform: `translateX(${compassOffset}px)` }}
              >
                {compassTicks.map((tickAngle) => {
                  const label = getCardinalLabel(tickAngle);
                  const isCard = isCardinal(tickAngle);
                  return (
                    <div 
                      key={tickAngle} 
                      className="compass-mark"
                      style={{ left: `${(tickAngle + 180) * (compassScaleWidth / 15)}px` }}
                    >
                      <div className={`compass-line ${isCard ? 'compass-line-major' : ''}`}></div>
                      <div className={`compass-text ${isCard ? 'compass-text-cardinal' : ''}`}>
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="compass-pointer-bottom">▲</div>
          </div>

          {/* Bottom-Right: Arrow nav + thumbnails */}
          <div className="control-panel interactive">
            <div className="arrows-group">
              <div className="btn-arrow" onClick={() => handleArrowNav('prev')} title="Previous Project">
                ◀
              </div>
              <div className="btn-arrow" onClick={() => handleArrowNav('next')} title="Next Project">
                ▶
              </div>
            </div>

            {/* Thumbnail carousel */}
            <div className="carousel-container">
              {[0, 1, 2, 3].map((idx) => {
                const colors = ["magenta", "cyan", "cyan", "magenta"];
                const titleAbbr = ["AGENT", "RAG", "MODELS", "WEBGL"];
                return (
                  <div 
                    key={idx}
                    className={`carousel-thumb ${activeProject === idx && viewMode === 'focus' ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(idx)}
                    title={projectDetails[idx].title}
                  >
                    {/* Simulated vector graphic as thumb thumbnail */}
                    <div style={{
                      width: '100%', 
                      height: '100%', 
                      background: activeProject === idx && viewMode === 'focus' 
                        ? 'radial-gradient(circle, rgba(255,0,127,0.15) 0%, rgba(0,0,0,0.8) 100%)'
                        : 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, rgba(0,0,0,0.9) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        border: `1px solid ${colors[idx] === 'magenta' ? '#ff007f' : '#00e5ff'}`,
                        borderRadius: idx === 1 ? '50%' : '2px',
                        boxShadow: `0 0 5px ${colors[idx] === 'magenta' ? 'rgba(255,0,127,0.4)' : 'rgba(0,229,255,0.4)'}`
                      }}></div>
                      <div className="carousel-thumb-overlay">{titleAbbr[idx]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </footer>
      </div>

      {/* --- DETAIL PROJECT SLIDE PANEL --- */}
      <div className={`detail-side-panel cyber-panel ${viewMode === 'focus' ? 'open' : ''} ${activeProject % 2 === 0 ? 'cyber-panel-magenta' : ''}`}>
        <div className="panel-header">
          <div className="panel-tag">
            {projectDetails[activeProject].tag}
          </div>
          <button className="panel-close-btn" onClick={onToggleViewMode}>
            CLOSE console //
          </button>
        </div>

        <h2 className="panel-title">{projectDetails[activeProject].title}</h2>

        <div className="panel-scrollable">
          <p className="panel-desc">
            {projectDetails[activeProject].desc}
          </p>

          <h3 className="panel-section-title">INTEGRATION MATRIX</h3>
          <div className="tech-tag-list">
            {projectDetails[activeProject].tech.map((t, idx) => (
              <span key={idx} className="tech-tag">{t}</span>
            ))}
          </div>

          <h3 className="panel-section-title">FLOW ARCHITECTURE</h3>
          <div className="architecture-box" dangerouslySetInnerHTML={{ __html: projectDetails[activeProject].architecture }}>
          </div>

          <h3 className="panel-section-title">METRIC METADATA</h3>
          <div className="metrics-grid">
            {projectDetails[activeProject].metrics.map((m, idx) => (
              <div key={idx} className="metric-item">
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">{m.value}</div>
              </div>
            ))}
          </div>

          <button className="btn-cyber-primary" onClick={() => { soundManager.playClick(); alert(`Initiating Demo for: ${projectDetails[activeProject].title}`); }}>
            INITIATE PROTOTYPE SESSION
          </button>
        </div>
      </div>

      {/* --- TERMINAL MODALS (ABOUT / CONTACT) --- */}
      {showModal && (
        <div className="hud-modal-overlay interactive" onClick={closeModal}>
          <div 
            className={`hud-modal cyber-panel ${showModal === 'contact' ? 'cyber-panel-magenta' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>CLOSE [X]</button>
            
            <div className="terminal-header">
              SECURE SHELL SYSTEM: {showModal === 'about' ? 'ABOUT_MINH_TRUONG.sh' : 'ESTABLISH_CONTACT.sh'}
            </div>

            <div className="terminal-body">
              {showModal === 'about' ? (
                <>
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>cat engineer_profile.log
                  </div>
                  <div className="terminal-line" style={{ color: '#00e5ff', marginTop: '10px' }}>
                    &gt; FULLSTACK AI ENGINEER // SPECIALIZATION: MULTI-AGENT SYSTEMS, RAG NETWORKS, SHADER PIPELINES
                  </div>
                  <div className="terminal-line" style={{ marginTop: '16px', fontSize: '13px' }}>
                    I am Minh Truong, an engineer focused on bridging autonomous cognitive intelligence and high-performance user experiences. I develop complex agent workflows (using LangGraph/LangChain), production-grade hybrid semantic vector search infrastructures (RAG), fine-tuned LLM architectures, and interactive 3D WebGL environments.
                  </div>
                  <div className="terminal-line" style={{ marginTop: '12px', fontSize: '13px' }}>
                    My mission is to deploy AI Agents that automate operational decision-making while providing fluid, responsive, and wowing spatial data visualisations.
                  </div>
                  <div className="terminal-line" style={{ color: '#ff007f', marginTop: '16px' }}>
                    [STATUS: AVAILABLE FOR ARCHITECTING CYBERNETIC STRUCTURES]
                  </div>
                </>
              ) : (
                <>
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>ssh contact@minhtruong.dev
                  </div>
                  <div className="terminal-line" style={{ color: '#ff007f', marginTop: '10px' }}>
                    &gt; REQUESTING COMMUNICATIONS STREAM LINK... CONNECTED.
                  </div>
                  <div className="terminal-line" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div><span style={{ color: '#00e5ff', width: '90px', display: 'inline-block' }}>EMAIL:</span> <a href="mailto:contact@minhtruong.dev" style={{ color: '#fff', textDecoration: 'underline' }}>contact@minhtruong.dev</a></div>
                    <div><span style={{ color: '#00e5ff', width: '90px', display: 'inline-block' }}>LINKEDIN:</span> <a href="https://linkedin.com/in/minhtruong" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>linkedin.com/in/minhtruong</a></div>
                    <div><span style={{ color: '#00e5ff', width: '90px', display: 'inline-block' }}>GITHUB:</span> <a href="https://github.com/minhtruong" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>github.com/minhtruong</a></div>
                  </div>
                  <div className="terminal-line" style={{ marginTop: '20px' }}>
                    <span className="terminal-prompt">&gt;</span> awaiting input...<span className="cursor-blink"></span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default HUDOverlay;
