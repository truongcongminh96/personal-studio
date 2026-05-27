/**
 * SoundManager - Pure Web Audio API Synthesizer for Cyberpunk Ambient Hum & SFX
 */
type WindowWithLegacyAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

class SoundManager {
  private ctx: AudioContext | null = null;
  
  // Ambient Sound Nodes
  private ambientGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private ambientActive: boolean = false;

  constructor() {}

  /**
   * Initializes the AudioContext if not already done.
   * Browsers restrict audio context until user interaction.
   */
  public init() {
    if (!this.ctx) {
      // Support legacy webkitAudioContext
      const AudioCtxClass = window.AudioContext || (window as WindowWithLegacyAudio).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.ctx = new AudioCtxClass();
    }
    
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Start generative cyberpunk ambient hum (low-frequency stereo drone)
   */
  public startAmbient() {
    this.init();
    if (!this.ctx || this.ambientActive) return;

    try {
      this.ambientActive = true;

      // 1. Create Nodes
      this.osc1 = this.ctx.createOscillator();
      this.osc2 = this.ctx.createOscillator();
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      
      this.filter = this.ctx.createBiquadFilter();
      this.ambientGain = this.ctx.createGain();

      // 2. Configure Oscillators (Generative Low hum in C)
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2 frequency

      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(65.80, this.ctx.currentTime); // Slightly detuned for chorusing

      // LFO for pulsing cutoff frequency (neon flicker effect)
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // Very slow pulse: 0.2Hz (5s cycle)
      lfoGain.gain.setValueAtTime(200, this.ctx.currentTime); // Amplitude of cutoff swing

      // Filter settings
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(2, this.ctx.currentTime);

      // Volume settings
      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime); // Start silent
      // Fade in smoothly over 2 seconds
      this.ambientGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 2.0);

      // 3. Connections
      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      
      // Hook up LFO to filter frequency parameter
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);

      this.filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      // 4. Start
      this.osc1.start(0);
      this.osc2.start(0);
      this.lfo.start(0);

    } catch (e) {
      console.warn("SoundManager: Failed to start ambient synthesis", e);
    }
  }

  /**
   * Stop/Fade out ambient drone
   */
  public stopAmbient() {
    if (!this.ctx || !this.ambientGain || !this.ambientActive) return;

    try {
      const now = this.ctx.currentTime;
      // Fade out over 0.8 seconds
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      const o1 = this.osc1;
      const o2 = this.osc2;
      const lf = this.lfo;

      // Stop nodes after fade complete
      setTimeout(() => {
        if (!this.ambientActive) {
          const nodes = [o1, o2, lf];
          nodes.forEach((node) => {
            try {
              node?.stop();
            } catch {
              // Already stopped nodes can throw in some browsers.
            }
          });
        }
      }, 900);

      this.ambientActive = false;
    } catch (e) {
      console.warn("SoundManager: Error stopping ambient synthesis", e);
      this.ambientActive = false;
    }
  }

  /**
   * Play high-tech UI console click sound
   */
  public playClick() {
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Synthesis: Short metallic ding + noise pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      // Pitch slide downwards
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(1, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);

    } catch {
      // Fail silently
    }
  }

  /**
   * Play soft, premium high-tech sweep when hovering items
   */
  public playHover() {
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      // Gentle rising sweep
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      filter.type = 'peaking';
      filter.frequency.setValueAtTime(600, now);
      filter.gain.setValueAtTime(6, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);

    } catch {
      // Fail silently
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
