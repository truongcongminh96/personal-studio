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
  const [showModal, setShowModal] = useState<'director' | 'booking' | null>(null);
  const [studioPreviewOpen, setStudioPreviewOpen] = useState(false);
  const [panelReadyKey, setPanelReadyKey] = useState<string | null>(null);
  const [clapperVisibleKey, setClapperVisibleKey] = useState<string | null>(null);
  const currentProject = projects[activeProject];
  const focusKey = viewMode === 'focus' ? `set-${activeProject}` : null;
  const panelOpen = Boolean(focusKey && panelReadyKey === focusKey);
  const clapper = focusKey && clapperVisibleKey === focusKey
    ? {
      take: String(activeProject + 1).padStart(2, '0'),
      abbr: currentProject.abbr,
      title: currentProject.title,
    }
    : null;
  const activeSection = showModal === 'director'
    ? 'DIRECTOR'
    : showModal === 'booking'
      ? 'BOOKING'
      : viewMode === 'focus'
        ? 'SETS'
        : 'DREAMSCAPE';

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

  useEffect(() => {
    let panelTimer: number | undefined;
    let clapperTimer: number | undefined;
    let resetTimer: number | undefined;

    if (focusKey) {
      resetTimer = window.setTimeout(() => {
        setPanelReadyKey(null);
        setClapperVisibleKey(focusKey);
      }, 0);
      panelTimer = window.setTimeout(() => setPanelReadyKey(focusKey), 210);
      clapperTimer = window.setTimeout(() => setClapperVisibleKey(null), 940);
    } else {
      resetTimer = window.setTimeout(() => {
        setPanelReadyKey(null);
        setClapperVisibleKey(null);
      }, 0);
    }

    return () => {
      if (resetTimer) window.clearTimeout(resetTimer);
      if (panelTimer) window.clearTimeout(panelTimer);
      if (clapperTimer) window.clearTimeout(clapperTimer);
    };
  }, [focusKey]);

  // Nav Item click
  const handleNavClick = (section: string) => {
    soundManager.playHoverClick();
    if (section === 'DIRECTOR') {
      setShowModal('director');
      onNavClick('ABOUT');
    } else if (section === 'BOOKING') {
      setShowModal('booking');
      onNavClick('CONTACT');
    } else if (section === 'DREAMSCAPE') {
      setShowModal(null);
      setStudioPreviewOpen(false);
      if (viewMode === 'focus') {
        onToggleViewMode();
      }
      onNavClick('EXPLORE');
    } else if (section === 'SETS') {
      setShowModal(null);
      setStudioPreviewOpen(false);
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
    setStudioPreviewOpen(false);
  };

  const openStudioPreview = () => {
    soundManager.playPanelOpen();
    setStudioPreviewOpen(true);
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
    const yawRad = Math.atan2(dx, dz);
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
              AI learning film studio for agents, retrieval systems, model craft, and WebGL scenes.
            </p>
          </div>

          <nav className="nav-menu interactive">
            <button
              className={`nav-item ${activeSection === 'DREAMSCAPE' ? 'active' : ''}`}
              onClick={() => handleNavClick('DREAMSCAPE')}
              onMouseEnter={() => soundManager.playHoverClick()}
            >
              Dreamscape
            </button>
            <button
              className={`nav-item ${activeSection === 'SETS' ? 'active' : ''}`}
              onClick={() => handleNavClick('SETS')}
              onMouseEnter={() => soundManager.playHoverClick()}
            >
              Sets
            </button>
            <button
              className={`nav-item ${activeSection === 'DIRECTOR' ? 'active' : ''}`}
              onClick={() => handleNavClick('DIRECTOR')}
              onMouseEnter={() => soundManager.playHoverClick()}
            >
              Director Note
            </button>
            <button
              className={`nav-item ${activeSection === 'BOOKING' ? 'active' : ''}`}
              onClick={() => handleNavClick('BOOKING')}
              onMouseEnter={() => soundManager.playHoverClick()}
            >
              Booking
            </button>

            <button className="btn-showroom" onClick={onToggleViewMode} onMouseEnter={() => soundManager.playHoverClick()}>
              {viewMode === 'explore' ? 'Enter Studio' : 'Back to Dreamscape'}
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

        {clapper && (
          <div className="studio-clapper" aria-live="polite">
            <div className="clapper-stripes" />
            <div className="clapper-copy">
              <span>TAKE {clapper.take}</span>
              <strong>{clapper.abbr}</strong>
              <small>{clapper.title}</small>
            </div>
          </div>
        )}

        <footer className="hud-bottom director-desk">
          <div className="radar-panel stage-map-panel studio-panel interactive" aria-label="Studio floor map">
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
                  <button
                    key={idx}
                    type="button"
                    className={`radar-project-dot ${isActive ? 'active' : ''}`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.z}%`,
                      backgroundColor: isActive ? '#e98d9c' : '#74b9aa',
                    }}
                    aria-label={`Enter ${projects[idx].abbr} set: ${projects[idx].title}`}
                    aria-pressed={isActive}
                    onClick={() => handleThumbnailClick(idx)}
                    onMouseEnter={() => soundManager.playHoverClick()}
                    title={projects[idx].title}
                  >
                    <span className="radar-tooltip">Enter {projects[idx].abbr}</span>
                  </button>
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
                CAM: [{cameraPos.x.toFixed(1)}, {cameraPos.z.toFixed(1)}]
              </div>

              <div className="radar-label">STUDIO MAP</div>
            </div>
          </div>

          <div className="compass-panel lens-ruler-panel studio-panel" aria-label="Lens bearing ruler">
            <div className="compass-bearing">
              LENS {cameraYaw.toFixed(0).padStart(3, '0')}°
            </div>
            <div className="shot-lock-label">
              {viewMode === 'focus' ? `SHOT LOCKED: ${currentProject.abbr}` : 'DREAMSCAPE PAN'}
            </div>
            <div className="lens-gate" aria-hidden="true">
              <span />
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
                      <div className={`compass-text ${isCard ? 'compass-text-cardinal' : 'compass-text-minor'} ${isLocked ? 'locked' : ''}`}>
                        {isCard ? label : ''}
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
                      <button
                        key={`${poi.index}-${offset}`}
                        type="button"
                        className={`compass-poi ${isActive ? 'active' : ''}`}
                        style={{ 
                          left: `${leftPos}px`,
                          color: poi.swatch,
                        }}
                        aria-label={`Frame ${poi.abbr} set`}
                        aria-pressed={isActive}
                        onClick={() => handleThumbnailClick(poi.index)}
                        onMouseEnter={() => soundManager.playHoverClick()}
                        title={`Navigate to: ${poi.title}`}
                      >
                        <div className="compass-poi-dot" style={{ backgroundColor: poi.swatch }} />
                        <div className="compass-poi-text">{poi.abbr}</div>
                      </button>
                    );
                  });
                })}
              </div>
            </div>
            <div className="compass-pointer-bottom">▲</div>
          </div>

          <div className="control-panel director-dock interactive" aria-label="Director set dock">
            <div className="control-panel-header">
              <div className="arrows-group">
                <button className="btn-arrow" type="button" onClick={() => handleArrowNav('prev')} onMouseEnter={() => soundManager.playHoverClick()} title="Previous set" aria-label="Previous set">
                  ◀
                </button>
                <button className="btn-arrow" type="button" onClick={() => handleArrowNav('next')} onMouseEnter={() => soundManager.playHoverClick()} title="Next set" aria-label="Next set">
                  ▶
                </button>
              </div>
              <div className="active-take-label">
                TAKE 0{activeProject + 1} / {currentProject.abbr}
              </div>
            </div>

            <div className="carousel-container set-dock">
              {projects.map((p, idx) => {
                const isActive = activeProject === idx && viewMode === 'focus';
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`carousel-thumb ${isActive ? 'active' : ''}`}
                    style={{ '--accent-color': p.swatch } as React.CSSProperties}
                    aria-label={`Open take ${idx + 1}: ${p.title}`}
                    aria-pressed={isActive}
                    onClick={() => handleThumbnailClick(idx)}
                    onMouseEnter={() => soundManager.playHoverClick()}
                    title={p.title}
                  >
                    <div className="carousel-thumb-icon-wrapper" style={{ color: p.swatch }}>
                      {renderProjectIcon(idx)}
                    </div>
                    <div className="carousel-thumb-overlay">T{idx + 1} / {p.abbr}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </footer>
      </div>

      <div className={`detail-side-panel studio-panel cyber-panel ${panelOpen ? 'open' : ''} ${activeProject % 2 === 0 ? 'cyber-panel-magenta' : ''}`}>
        <div className="panel-header">
          <div className="panel-tag">
            Production Notes / {currentProject.tag}
          </div>
          <button className="panel-close-btn" onClick={onToggleViewMode} onMouseEnter={() => soundManager.playHoverClick()}>
            Close
          </button>
        </div>

        <h2 className="panel-title">{currentProject.title}</h2>

        <div className="panel-scrollable">
          <h3 className="panel-section-title">Scene Brief</h3>
          <p className="panel-desc">
            {currentProject.desc}
          </p>

          <h3 className="panel-section-title">Toolkit</h3>
          <div className="tech-tag-list">
            {currentProject.tech.map((t, idx) => (
              <span key={idx} className="tech-tag">{t}</span>
            ))}
          </div>

          <h3 className="panel-section-title">Pipeline</h3>
          <ArchitectureDiagram index={activeProject} />

          <h3 className="panel-section-title">Key Shots</h3>
          <div className="metrics-grid">
            {currentProject.metrics.map((m, idx) => (
              <div key={idx} className="metric-item">
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">{m.value}</div>
              </div>
            ))}
          </div>

          <button className="btn-cyber-primary btn-studio-primary" onClick={openStudioPreview} onMouseEnter={() => soundManager.playHoverClick()}>
            Open Studio Preview
          </button>
        </div>
      </div>

      {(showModal || studioPreviewOpen) && (
        <div className="hud-modal-overlay interactive" onClick={closeModal}>
          <div
            className={`hud-modal studio-panel cyber-panel ${showModal === 'booking' ? 'cyber-panel-magenta' : ''} ${studioPreviewOpen ? 'studio-preview-modal' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal} onMouseEnter={() => soundManager.playHoverClick()}>Close</button>

            <div className="terminal-header">
              {studioPreviewOpen ? `${currentProject.abbr} Studio Preview` : showModal === 'director' ? 'Director Note' : 'Booking'}
            </div>

            <div className="terminal-body">
              {studioPreviewOpen ? (
                <>
                  <div className="preview-slate">
                    <div className="preview-shot-card">
                      <span>Scene</span>
                      <strong>{currentProject.cardTitle}</strong>
                      <small>{currentProject.subtitle}</small>
                    </div>
                    <div className="preview-shot-card">
                      <span>Camera Move</span>
                      <strong>Dolly In</strong>
                      <small>Card opens into a notebook plane with active stage props.</small>
                    </div>
                    <div className="preview-shot-card">
                      <span>Light Cue</span>
                      <strong>{currentProject.tag}</strong>
                      <small>Accent rim light, spotlight halo, and prop glow follow this set.</small>
                    </div>
                  </div>
                  <div className="preview-timeline" aria-label="Studio preview timeline">
                    <div><span>Problem</span><strong>{currentProject.details[0]}</strong></div>
                    <div><span>Architecture</span><strong>{currentProject.details[1]}</strong></div>
                    <div><span>Demo</span><strong>{currentProject.details[2]}</strong></div>
                    <div><span>Result</span><strong>{currentProject.metrics[0].value}</strong></div>
                  </div>
                </>
              ) : showModal === 'director' ? (
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
