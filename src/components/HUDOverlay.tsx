import React, { useState, useEffect, useRef } from 'react';
import { projects, PROJECT_COUNT } from '../data/projects';
import { getCardinalLabel, isCardinal } from '../utils/hudUtils';
import ArchitectureDiagram from './ArchitectureDiagram';
import { soundManager } from '../utils/soundEffects';

const renderProjectIcon = (index: number) => {
  switch (index) {
    case 0: // AGENT
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="carousel-svg-icon">
          <circle cx="12" cy="12" r="3" />
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <line x1="8" y1="8" x2="10" y2="10" />
          <line x1="16" y1="8" x2="14" y2="10" />
          <line x1="8" y1="16" x2="10" y2="14" />
          <line x1="16" y1="16" x2="14" y2="14" />
        </svg>
      );
    case 1: // RAG
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="carousel-svg-icon">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
          <line x1="12" y1="8" x2="12" y2="11" />
          <line x1="12" y1="14" x2="12" y2="17" />
        </svg>
      );
    case 2: // MODELS
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="carousel-svg-icon">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="15" x2="4" y2="15" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="15" x2="23" y2="15" />
        </svg>
      );
    case 3: // WEBGL
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="carousel-svg-icon active-spin">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
          <line x1="12" y1="22" x2="12" y2="12" />
          <line x1="2" y1="7" x2="2" y2="17" />
          <line x1="22" y1="7" x2="22" y2="17" />
        </svg>
      );
    default:
      return null;
  }
};

interface HUDOverlayProps {
  activeProject: number;
  viewMode: 'explore' | 'focus';
  cameraYaw: number;
  cameraPos: { x: number; z: number };
  onSelectProject: (index: number) => void;
  onToggleViewMode: () => void;
  onNavClick: (section: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  activeProject,
  viewMode,
  cameraYaw,
  cameraPos,
  onSelectProject,
  onToggleViewMode,
  onNavClick,
  soundEnabled,
  onToggleSound,
}) => {
  const [showModal, setShowModal] = useState<'about' | 'contact' | null>(null);
  const activeSection = showModal ? showModal.toUpperCase() : viewMode === 'focus' ? 'PROJECTS' : 'EXPLORE';

  // Sync sound manager state
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Play sound when view mode changes
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (viewMode === 'focus') {
      soundManager.playPanelOpen();
    } else {
      soundManager.playViewModeToggle();
    }
  }, [viewMode]);

  // Nav Item click
  const handleNavClick = (section: string) => {
    soundManager.playHoverClick();
    if (section === 'ABOUT') {
      setShowModal('about');
      onNavClick('ABOUT');
    } else if (section === 'CONTACT') {
      setShowModal('contact');
      onNavClick('CONTACT');
    } else if (section === 'EXPLORE') {
      if (viewMode === 'focus') {
        onToggleViewMode();
      }
      onNavClick('EXPLORE');
    } else if (section === 'PROJECTS') {
      if (viewMode === 'explore') {
        onToggleViewMode();
      }
      onNavClick('PROJECTS');
    }
  };

  const handleArrowNav = (direction: 'prev' | 'next') => {
    soundManager.playSelectProject();
    const newIdx = direction === 'prev'
      ? (activeProject - 1 + PROJECT_COUNT) % PROJECT_COUNT
      : (activeProject + 1) % PROJECT_COUNT;

    if (viewMode === 'explore') {
      onToggleViewMode();
    }
    onSelectProject(newIdx);
  };

  const handleThumbnailClick = (index: number) => {
    soundManager.playSelectProject();
    if (viewMode === 'explore') {
      onToggleViewMode();
    }
    onSelectProject(index);
  };

  const closeModal = () => {
    soundManager.playHoverClick();
    setShowModal(null);
  };

  // --- COORDINATE MAPPER FOR RADAR ---
  const radarDotX = 50 + (cameraPos.x / 14) * 50;
  const radarDotZ = 50 + (cameraPos.z / 14) * 50;

  const radarProjectPositions = projects.map(p => ({
    x: 50 + (p.radarX / 14) * 50,
    z: 50 + (p.radarZ / 14) * 50,
  }));

  // --- GENERATE COMPASS TICKS ---
  const compassScaleWidth = 40;
  const compassTicks: number[] = [];
  for (let i = -180; i <= 540; i += 15) {
    compassTicks.push(i);
  }

  const compassOffset = -(cameraYaw * (compassScaleWidth / 15));

  // --- CALCULATE PROJECT POI ANGLES ---
  const projectPOIs = projects.map((p, idx) => {
    const cardPositions = [
      { x: -5.0, z: -1.6 },
      { x: -1.7, z: -0.4 },
      { x: 1.7,  z: -0.4 },
      { x: 5.0,  z: -1.6 },
    ];
    const pos = cardPositions[idx];
    const dx = pos.x - cameraPos.x;
    const dz = pos.z - cameraPos.z;
    let yawRad = Math.atan2(dx, dz);
    let yawDeg = yawRad * (180 / Math.PI);
    if (yawDeg < 0) yawDeg += 360;
    return {
      index: idx,
      yaw: yawDeg,
      abbr: p.abbr,
      swatch: p.swatch,
      title: p.title,
    };
  });

  return (
    <>
      <div className="hud-container">
        <div className="hud-corner hud-corner-tl"></div>
        <div className="hud-corner hud-corner-tr"></div>
        <div className="hud-corner hud-corner-bl"></div>
        <div className="hud-corner hud-corner-br"></div>

        <div className="hud-crosshair-left">+</div>
        <div className="hud-crosshair-right">+</div>

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
              onMouseEnter={() => soundManager.playHoverClick()}
            >
              EXPLORE
            </div>
            <div
              className={`nav-item ${activeSection === 'PROJECTS' ? 'active' : ''}`}
              onClick={() => handleNavClick('PROJECTS')}
              onMouseEnter={() => soundManager.playHoverClick()}
            >
              PROJECTS
            </div>
            <div
              className={`nav-item ${activeSection === 'ABOUT' ? 'active' : ''}`}
              onClick={() => handleNavClick('ABOUT')}
              onMouseEnter={() => soundManager.playHoverClick()}
            >
              ABOUT
            </div>
            <div
              className={`nav-item ${activeSection === 'CONTACT' ? 'active' : ''}`}
              onClick={() => handleNavClick('CONTACT')}
              onMouseEnter={() => soundManager.playHoverClick()}
            >
              CONTACT
            </div>

            <button className="btn-showroom" onClick={onToggleViewMode} onMouseEnter={() => soundManager.playHoverClick()}>
              {viewMode === 'explore' ? 'Open Studio View' : 'Dreamscape View'}
            </button>
          </nav>

          <div 
            className={`sound-control interactive ${soundEnabled ? 'active' : ''}`}
            onClick={() => {
              onToggleSound();
              soundManager.playHoverClick();
            }}
            onMouseEnter={() => soundManager.playHoverClick()}
          >
            <span>SOUND {soundEnabled ? 'ON' : 'OFF'}</span>
            <div className="sound-wave">
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
            </div>
          </div>
        </header>

        <footer className="hud-bottom">
          <div className="radar-panel cyber-panel interactive">
            <div className="radar-display">
              <div className="radar-circle radar-circle-1"></div>
              <div className="radar-circle radar-circle-2"></div>
              <div className="radar-circle radar-circle-3"></div>
              <div className="radar-crosshair-h"></div>
              <div className="radar-crosshair-v"></div>
              <div className="radar-sweep"></div>

              {radarProjectPositions.map((pos, idx) => {
                const isActive = idx === activeProject && viewMode === 'focus';
                return (
                  <div
                    key={idx}
                    className={`radar-project-dot ${isActive ? 'active' : ''}`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.z}%`,
                      backgroundColor: isActive ? '#e98d9c' : '#74b9aa',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleThumbnailClick(idx)}
                    onMouseEnter={() => soundManager.playHoverClick()}
                    title={projects[idx].title}
                  >
                    <span className="radar-tooltip">{projects[idx].abbr}</span>
                  </div>
                );
              })}

              <div
                className="radar-dot"
                style={{
                  left: `${radarDotX}%`,
                  top: `${radarDotZ}%`
                }}
              >
                <div
                  className="radar-fov"
                  style={{ transform: `translate(-50%, 0) rotate(${-cameraYaw}deg)` }}
                />
              </div>

              <div className="radar-coords">
                POS: [{cameraPos.x.toFixed(1)}, {cameraPos.z.toFixed(1)}]
              </div>

              <div className="radar-label">MAP POSITION</div>
            </div>
          </div>

          <div className="compass-panel cyber-panel">
            <div className="compass-bearing">
              HEADING: {cameraYaw.toFixed(0).padStart(3, '0')}°
            </div>
            <div className="compass-pointer-top">▼</div>
            <div className="compass-container">
              <div
                className="compass-scale"
                style={{ transform: `translateX(${compassOffset}px)` }}
              >
                {compassTicks.map((tickAngle) => {
                  const label = getCardinalLabel(tickAngle);
                  const isCard = isCardinal(tickAngle);
                  const normalTick = (tickAngle + 360) % 360;
                  const isLocked = isCard && Math.abs(normalTick - cameraYaw) < 6.0;

                  return (
                    <div
                      key={tickAngle}
                      className="compass-mark"
                      style={{ left: `${(tickAngle + 180) * (compassScaleWidth / 15)}px` }}
                    >
                      <div className={`compass-line ${isCard ? 'compass-line-major' : ''} ${isLocked ? 'locked' : ''}`}></div>
                      <div className={`compass-text ${isCard ? 'compass-text-cardinal' : ''} ${isLocked ? 'locked' : ''}`}>
                        {label}
                      </div>
                    </div>
                  );
                })}

                {/* Project POI Indicators on sliding scale */}
                {projectPOIs.map((poi) => {
                  const offsets = [0];
                  if (poi.yaw < 180) offsets.push(360);
                  if (poi.yaw > 180) offsets.push(-360);
                  
                  return offsets.map((offset) => {
                    const angle = poi.yaw + offset;
                    const leftPos = (angle + 180) * (compassScaleWidth / 15);
                    const isActive = activeProject === poi.index && viewMode === 'focus';
                    return (
                      <div
                        key={`${poi.index}-${offset}`}
                        className={`compass-poi ${isActive ? 'active' : ''}`}
                        style={{ 
                          left: `${leftPos}px`,
                        }}
                        onClick={() => handleThumbnailClick(poi.index)}
                        onMouseEnter={() => soundManager.playHoverClick()}
                        title={`Navigate to: ${poi.title}`}
                      >
                        <div className="compass-poi-dot" style={{ backgroundColor: poi.swatch }} />
                        <div className="compass-poi-text" style={{ color: poi.swatch }}>{poi.abbr}</div>
                      </div>
                    );
                  });
                })}
              </div>
            </div>
            <div className="compass-pointer-bottom">▲</div>
          </div>

          <div className="control-panel interactive">
            <div className="control-panel-header">
              <div className="arrows-group">
                <div className="btn-arrow" onClick={() => handleArrowNav('prev')} onMouseEnter={() => soundManager.playHoverClick()} title="Previous Project">
                  ◀
                </div>
                <div className="btn-arrow" onClick={() => handleArrowNav('next')} onMouseEnter={() => soundManager.playHoverClick()} title="Next Project">
                  ▶
                </div>
              </div>
              <div className="carousel-index">
                INDEX: 0{activeProject + 1} / 0{PROJECT_COUNT}
              </div>
            </div>

            <div className="carousel-container">
              {projects.map((p, idx) => {
                const isActive = activeProject === idx && viewMode === 'focus';
                return (
                  <div
                    key={idx}
                    className={`carousel-thumb ${isActive ? 'active' : ''}`}
                    style={{ '--accent-color': p.swatch } as React.CSSProperties}
                    onClick={() => handleThumbnailClick(idx)}
                    onMouseEnter={() => soundManager.playHoverClick()}
                    title={p.title}
                  >
                    <div className="carousel-thumb-icon-wrapper" style={{ color: p.swatch }}>
                      {renderProjectIcon(idx)}
                    </div>
                    <div className="carousel-thumb-overlay">{p.abbr}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </footer>
      </div>

      <div className={`detail-side-panel cyber-panel ${viewMode === 'focus' ? 'open' : ''} ${activeProject % 2 === 0 ? 'cyber-panel-magenta' : ''}`}>
        <div className="panel-header">
          <div className="panel-tag">
            {projects[activeProject].tag}
          </div>
          <button className="panel-close-btn" onClick={onToggleViewMode} onMouseEnter={() => soundManager.playHoverClick()}>
            Close
          </button>
        </div>

        <h2 className="panel-title">{projects[activeProject].title}</h2>

        <div className="panel-scrollable">
          <p className="panel-desc">
            {projects[activeProject].desc}
          </p>

          <h3 className="panel-section-title">Toolkit</h3>
          <div className="tech-tag-list">
            {projects[activeProject].tech.map((t, idx) => (
              <span key={idx} className="tech-tag">{t}</span>
            ))}
          </div>

          <h3 className="panel-section-title">Project Flow</h3>
          <ArchitectureDiagram index={activeProject} />

          <h3 className="panel-section-title">Highlights</h3>
          <div className="metrics-grid">
            {projects[activeProject].metrics.map((m, idx) => (
              <div key={idx} className="metric-item">
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">{m.value}</div>
              </div>
            ))}
          </div>

          <button className="btn-cyber-primary" onClick={() => { alert(`Opening studio preview for: ${projects[activeProject].title}`); }} onMouseEnter={() => soundManager.playHoverClick()}>
            Open Studio Preview
          </button>
        </div>
      </div>

      {showModal && (
        <div className="hud-modal-overlay interactive" onClick={closeModal}>
          <div
            className={`hud-modal cyber-panel ${showModal === 'contact' ? 'cyber-panel-magenta' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal} onMouseEnter={() => soundManager.playHoverClick()}>CLOSE [X]</button>

            <div className="terminal-header">
              {showModal === 'about' ? 'About Minh' : 'Contact'}
            </div>

            <div className="terminal-body">
              {showModal === 'about' ? (
                <>
                  <div className="terminal-line">
                    <span className="terminal-prompt">Studio note</span>
                  </div>
                  <div className="terminal-line" style={{ color: '#4f7f76', marginTop: '10px' }}>
                    Fullstack AI engineer focused on multi-agent systems, RAG networks, and shader pipelines.
                  </div>
                  <div className="terminal-line" style={{ marginTop: '16px', fontSize: '13px' }}>
                    I am Minh Truong, an engineer focused on bridging autonomous cognitive intelligence and high-performance user experiences. I develop complex agent workflows (using LangGraph/LangChain), production-grade hybrid semantic vector search infrastructures (RAG), fine-tuned LLM architectures, and interactive 3D WebGL environments.
                  </div>
                  <div className="terminal-line" style={{ marginTop: '12px', fontSize: '13px' }}>
                    My mission is to deploy AI Agents that automate operational decision-making while providing fluid, responsive, and wowing spatial data visualisations.
                  </div>
                  <div className="terminal-line" style={{ color: '#9e5662', marginTop: '16px' }}>
                    Available for thoughtful AI architecture and interactive product work.
                  </div>
                </>
              ) : (
                <>
                  <div className="terminal-line">
                    <span className="terminal-prompt">Say hello</span>
                  </div>
                  <div className="terminal-line" style={{ color: '#9e5662', marginTop: '10px' }}>
                    The studio inbox is open for collaborations, prototypes, and AI systems work.
                  </div>
                  <div className="terminal-line" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div><span style={{ color: '#4f7f76', width: '90px', display: 'inline-block' }}>EMAIL:</span> <a href="mailto:contact@minhtruong.dev" style={{ color: '#51475c', textDecoration: 'underline' }}>contact@minhtruong.dev</a></div>
                    <div><span style={{ color: '#4f7f76', width: '90px', display: 'inline-block' }}>LINKEDIN:</span> <a href="https://linkedin.com/in/minhtruong" target="_blank" rel="noreferrer" style={{ color: '#51475c', textDecoration: 'underline' }}>linkedin.com/in/minhtruong</a></div>
                    <div><span style={{ color: '#4f7f76', width: '90px', display: 'inline-block' }}>GITHUB:</span> <a href="https://github.com/minhtruong" target="_blank" rel="noreferrer" style={{ color: '#51475c', textDecoration: 'underline' }}>github.com/minhtruong</a></div>
                  </div>
                  <div className="terminal-line" style={{ marginTop: '20px' }}>
                    <span className="terminal-prompt">Ready</span><span className="cursor-blink"></span>
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
