class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private init() {
    if (this.ctx) return;
    // Support standard and legacy webkit AudioContext
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  setEnabled(val: boolean) {
    this.enabled = val;
    if (val) {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
  }

  private createOscillator(type: OscillatorType, freq: number, duration: number, gainStart: number) {
    this.init();
    if (!this.ctx || !this.enabled) return null;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(gainStart, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    return { osc, gainNode };
  }

  playHoverClick() {
    const sound = this.createOscillator('sine', 1300, 0.04, 0.05);
    if (!sound) return;
    sound.osc.start();
    sound.osc.stop(this.ctx!.currentTime + 0.04);
  }

  playSelectProject() {
    const sound1 = this.createOscillator('sine', 587.33, 0.12, 0.08); // D5
    if (!sound1) return;
    sound1.osc.start();
    sound1.osc.stop(this.ctx!.currentTime + 0.12);

    setTimeout(() => {
      if (!this.ctx || !this.enabled) return;
      const sound2 = this.createOscillator('sine', 783.99, 0.22, 0.06); // G5
      if (!sound2) return;
      sound2.osc.start();
      sound2.osc.stop(this.ctx!.currentTime + 0.22);
    }, 50);
  }

  playViewModeToggle() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.16);

    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  playPanelOpen() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.22);

    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }
}

export const soundManager = new SoundManager();
