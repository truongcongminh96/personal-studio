import { useState, useCallback } from 'react';
import Showroom3D from './components/Showroom3D';
import HUDOverlay from './components/HUDOverlay';
import DreamVideoBackground from './components/DreamVideoBackground';
import './App.css';

function App() {
  const [activeProject, setActiveProject] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'explore' | 'focus'>('explore');
  const [videoSoundEnabled, setVideoSoundEnabled] = useState(true);
  
  // Real-time camera states to feed into HUD (compass & mini-map)
  const [cameraYaw, setCameraYaw] = useState<number>(0);
  const [cameraPos, setCameraPos] = useState<{ x: number; z: number }>({ x: 0, z: 7.5 });

  // Handle camera position/rotation change callback from Three.js render loop
  const handleCameraChange = useCallback((yawDegrees: number, posX: number, posZ: number) => {
    setCameraYaw(yawDegrees);
    setCameraPos({ x: posX, z: posZ });
  }, []);

  // Handle selecting a project (e.g. clicking thumbnails or nav arrows)
  const handleSelectProject = useCallback((index: number) => {
    setActiveProject(index);
    setViewMode('focus');
  }, []);

  // Toggle between interactive panorama and focused card modes
  const handleToggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'explore' ? 'focus' : 'explore'));
  }, []);

  // Handle clicking navbar sections
  const handleNavClick = useCallback((section: string) => {
    if (section === 'EXPLORE') {
      setViewMode('explore');
    } else if (section === 'PROJECTS') {
      setViewMode('focus');
    }
  }, []);

  // Handle clicking a 3D floating card in the showroom
  const handleCardClick = useCallback((index: number) => {
    setActiveProject(index);
    setViewMode('focus');
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#fff7ef',
      }}
    >
      {/* Cinematic Looping Video Background Layer */}
      <DreamVideoBackground
        src="/videos/dream-lab-background.mp4"
        opacity={1}
        soundEnabled={videoSoundEnabled}
      />

      {/* Existing UI Layer */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          minHeight: '100vh',
        }}
      >
        {/* 3D WebGL Showroom Background */}
        <Showroom3D
          activeProject={activeProject}
          viewMode={viewMode}
          onCameraChange={handleCameraChange}
          onCardClick={handleCardClick}
        />

        {/* Cyber HUD Interactive Overlay */}
        <HUDOverlay
          activeProject={activeProject}
          viewMode={viewMode}
          cameraYaw={cameraYaw}
          cameraPos={cameraPos}
          onSelectProject={handleSelectProject}
          onToggleViewMode={handleToggleViewMode}
          onNavClick={handleNavClick}
          soundEnabled={videoSoundEnabled}
          onToggleSound={() => setVideoSoundEnabled((enabled) => !enabled)}
        />
      </main>
    </div>
  );
}

export default App;
