import React, { useState } from 'react';
import { projects, PROJECT_COUNT } from '../data/projects';
import { getCardinalLabel, isCardinal } from '../utils/hudUtils';
import ArchitectureDiagram from './ArchitectureDiagram';

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

  // Nav Item click
  const handleNavClick = (section: string) => {
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
    const newIdx = direction === 'prev'
      ? (activeProject - 1 + PROJECT_COUNT) % PROJECT_COUNT
      : (activeProject + 1) % PROJECT_COUNT;

    if (viewMode === 'explore') {
      onToggleViewMode();
    }
    onSelectProject(newIdx);
  };

  const handleThumbnailClick = (index: number) => {
    if (viewMode === 'explore') {
      onToggleViewMode();
    }
    onSelectProject(index);
  };

  const closeModal = () => {
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
              {viewMode === 'explore' ? 'Open Studio View' : 'Dreamscape View'}
            </button>
          </nav>

          <div 
            className={`sound-control interactive ${soundEnabled ? 'active' : ''}`}
            onClick={onToggleSound}
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

              {radarProjectPositions.map((pos, idx) => (
                <div
                  key={idx}
                  className="radar-project-dot"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.z}%`,
                    backgroundColor: idx === activeProject && viewMode === 'focus' ? '#e98d9c' : '#74b9aa',
                    boxShadow: idx === activeProject && viewMode === 'focus' ? '0 0 0 5px rgba(233, 141, 156, 0.16)' : '0 0 0 4px rgba(116, 185, 170, 0.14)'
                  }}
                  title={projects[idx].title}
                ></div>
              ))}

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

          <div className="control-panel interactive">
            <div className="arrows-group">
              <div className="btn-arrow" onClick={() => handleArrowNav('prev')} title="Previous Project">
                ◀
              </div>
              <div className="btn-arrow" onClick={() => handleArrowNav('next')} title="Next Project">
                ▶
              </div>
            </div>

            <div className="carousel-container">
              {projects.map((p, idx) => (
                <div
                  key={idx}
                  className={`carousel-thumb ${activeProject === idx && viewMode === 'focus' ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(idx)}
                  title={p.title}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: activeProject === idx && viewMode === 'focus'
                      ? 'radial-gradient(circle, rgba(255,240,190,0.72) 0%, rgba(255,220,227,0.78) 100%)'
                      : 'radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(216,240,221,0.56) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      border: `2px solid ${p.swatch}`,
                      borderRadius: p.carouselShape === 'circle' ? '50%' : '4px',
                      background: 'rgba(255, 250, 240, 0.72)'
                    }}></div>
                    <div className="carousel-thumb-overlay">{p.abbr}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </footer>
      </div>

      <div className={`detail-side-panel cyber-panel ${viewMode === 'focus' ? 'open' : ''} ${activeProject % 2 === 0 ? 'cyber-panel-magenta' : ''}`}>
        <div className="panel-header">
          <div className="panel-tag">
            {projects[activeProject].tag}
          </div>
          <button className="panel-close-btn" onClick={onToggleViewMode}>
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

          <button className="btn-cyber-primary" onClick={() => { alert(`Opening studio preview for: ${projects[activeProject].title}`); }}>
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
            <button className="modal-close" onClick={closeModal}>CLOSE [X]</button>

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
