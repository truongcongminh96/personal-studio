import React, { useRef, useEffect, useState } from 'react';

interface DreamVideoBackgroundProps {
  src?: string;
  sources?: string[];
  opacity?: number;
  soundEnabled?: boolean;
}

const getPrefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const DreamVideoBackground: React.FC<DreamVideoBackgroundProps> = ({
  src = '/videos/dream-lab-background.mp4',
  sources,
  opacity = 1,
  soundEnabled = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSources = sources?.length ? sources : [src];
  const sourceCount = videoSources.length;
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);
  const [videoError, setVideoError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mountOpacity, setMountOpacity] = useState(0);
  const activeSrc = videoSources[activeSourceIndex % sourceCount];

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Fade-in on mount / load over 800ms
  useEffect(() => {
    if (prefersReducedMotion || videoError) return;

    const timer = setTimeout(() => {
      setMountOpacity(opacity);
    }, 50);

    return () => clearTimeout(timer);
  }, [opacity, prefersReducedMotion, videoError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion || videoError) return;

    video.volume = 0.72;
    video.muted = !soundEnabled;

    video.play().catch((err) => {
      if (!soundEnabled) return;

      console.warn('Video autoplay with sound was blocked:', err);
      video.muted = true;
      video.play().catch((playErr) => {
        console.warn('Muted video autoplay failed:', playErr);
      });
    });
  }, [soundEnabled, prefersReducedMotion, videoError, activeSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !soundEnabled || prefersReducedMotion || videoError) return;

    const unlockVideoSound = () => {
      video.volume = 0.72;
      video.muted = false;
      video.play().catch((err) => {
        console.warn('Video sound unlock failed:', err);
      });
    };

    window.addEventListener('pointerdown', unlockVideoSound, { once: true });
    window.addEventListener('keydown', unlockVideoSound, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockVideoSound);
      window.removeEventListener('keydown', unlockVideoSound);
    };
  }, [soundEnabled, prefersReducedMotion, videoError]);

  // Seamless manual playlist logic (using requestAnimationFrame & refs)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion || videoError) return;

    let animationFrameId: number;
    let isTransitioning = false;

    const checkLoop = () => {
      if (video.duration) {
        const current = video.currentTime;
        const duration = video.duration;

        if (duration - current < 0.5) {
          const progress = (duration - current) / 0.5;
          video.style.opacity = String(opacity * Math.max(0, progress));

          if (duration - current <= 0.08 && !isTransitioning) {
            isTransitioning = true;
            video.style.opacity = '0';

            setTimeout(() => {
              if (sourceCount > 1) {
                setActiveSourceIndex((index) => (index + 1) % sourceCount);
                isTransitioning = false;
                return;
              }

              video.currentTime = 0;
              video.play()
                .then(() => {
                  isTransitioning = false;
                })
                .catch((err) => {
                  console.warn('Video replay play-trigger failed:', err);
                  isTransitioning = false;
                });
            }, 100);
          }
        } else if (current < 0.5) {
          const progress = current / 0.5;
          video.style.opacity = String(opacity * progress);
        } else {
          video.style.opacity = String(opacity);
        }
      }

      animationFrameId = requestAnimationFrame(checkLoop);
    };

    const handleEnded = () => {
      if (!isTransitioning) {
        isTransitioning = true;
        video.style.opacity = '0';

        setTimeout(() => {
          if (sourceCount > 1) {
            setActiveSourceIndex((index) => (index + 1) % sourceCount);
            isTransitioning = false;
            return;
          }

          video.currentTime = 0;
          video.play()
            .then(() => {
              isTransitioning = false;
            })
            .catch((err) => {
              console.warn('Video replay on ended failed:', err);
              isTransitioning = false;
            });
        }, 100);
      }
    };

    video.addEventListener('ended', handleEnded);
    animationFrameId = requestAnimationFrame(checkLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('ended', handleEnded);
    };
  }, [opacity, prefersReducedMotion, videoError, isLoaded, sourceCount]);

  const handleVideoLoad = () => {
    setIsLoaded(true);

    const video = videoRef.current;
    if (!video) return;

    setMountOpacity(opacity);
    video.volume = 0.72;
    video.muted = !soundEnabled;
    video.play().catch((err) => {
      if (!soundEnabled) {
        console.warn('Muted video autoplay failed:', err);
        return;
      }

      console.warn('Video autoplay with sound was blocked:', err);
      video.muted = true;
      video.play().catch((playErr) => {
        console.warn('Muted video autoplay failed:', playErr);
      });
    });
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  if (prefersReducedMotion || videoError) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(135deg, #f8e7e9 0%, #fff7ef 50%, #f6ead8 100%)',
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#fff7ef',
      }}
    >
      <video
        ref={videoRef}
        src={activeSrc}
        autoPlay
        muted={!soundEnabled}
        playsInline
        preload="auto"
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: mountOpacity,
          transition: 'opacity 800ms ease-out',
          pointerEvents: 'none',
        }}
      />

      {/* Layer 1: soft white veil */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          pointerEvents: 'none',
        }}
      />

      {/* Layer 2: vertical linear gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(248, 231, 233, 0.08) 0%, transparent 48%, rgba(246, 234, 216, 0.14) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Optional: Soft vignette / blur layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, transparent 65%, rgba(143, 103, 111, 0.06) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default DreamVideoBackground;
