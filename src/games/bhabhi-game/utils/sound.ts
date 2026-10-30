// Procedural Web Audio API sound synthesizer for Bhabhi card game
// Generates rich, physical, zero-latency sound effects for all game actions.

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

class BhabhiSoundFX {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;
  private volume: number = 0.85; // 0.0 to 1.0
  private lastHoverTime: number = 0;

  constructor() {
    // Read saved sound settings if available in browser
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('fwd_sfx_muted');
        if (savedMute !== null) {
          this.muted = savedMute === 'true';
        }
        const savedVol = localStorage.getItem('fwd_sfx_volume');
        if (savedVol !== null) {
          const parsed = Number(savedVol);
          if (!isNaN(parsed)) {
            this.volume = Math.max(0, Math.min(1, parsed / 100));
          }
        }
      } catch (e) {}
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(
          this.muted ? 0 : this.volume,
          this.ctx.currentTime
        );
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private getDestinationNode(ctx: AudioContext): AudioNode {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.muted ? 0 : this.volume,
        ctx.currentTime
      );
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, now);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public setVolume(volume: number): void {
    // Accept 0.0-1.0 or 0-100
    const normalized = volume > 1 ? volume / 100 : volume;
    this.volume = Math.max(0, Math.min(1, normalized));
    if (this.ctx && this.masterGain && !this.muted) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.volume, now);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Crisp modern button tap
   */
  public playTap(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.045);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * Subtle paper friction tick when hovering over playable cards in hand
   */
  public playCardHover(): void {
    if (this.muted) return;
    const nowMs = Date.now();
    // Throttle to avoid excessive overlapping ticks
    if (nowMs - this.lastHoverTime < 55) return;
    this.lastHoverTime = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      const bufferSize = Math.floor(ctx.sampleRate * 0.018);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2800, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(now);
    } catch (e) {}
  }

  /**
   * Card slide / draw whoosh when pulling card out of hand
   */
  public playCardSlide(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      const duration = 0.085;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + duration);
      filter.Q.setValueAtTime(2.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(now);
    } catch (e) {}
  }

  /**
   * Crisp, tactile card snap / slap onto the felt table
   * Features a physical transient snap, high paper whip, and low felt thud
   */
  public playCardSnap(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      // Random micro-pitch jitter for organic card variety
      const jitter = (Math.random() - 0.5) * 80;

      // 1. Transient paper snap noise burst
      const noiseDur = 0.042;
      const bufferSize = Math.floor(ctx.sampleRate * noiseDur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Decaying noise
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1850 + jitter, now);
      bandpass.Q.setValueAtTime(2.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.24, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDur);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(dest);
      noise.start(now);

      // 2. Woody / felt surface thud body
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(210 + jitter * 0.5, now);
      thudOsc.frequency.exponentialRampToValueAtTime(70, now + 0.055);

      thudGain.gain.setValueAtTime(0.2, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      thudOsc.connect(thudGain);
      thudGain.connect(dest);

      thudOsc.start(now);
      thudOsc.stop(now + 0.065);

      // 3. High flick click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(3200 + jitter * 2, now);
      clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

      clickGain.gain.setValueAtTime(0.08, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      clickOsc.connect(clickGain);
      clickGain.connect(dest);

      clickOsc.start(now);
      clickOsc.stop(now + 0.018);
    } catch (e) {}
  }

  /**
   * Dramatic THOKO / Trick Break penalty drop
   * Heavy sub-bass earthquake drop + crunchy slap + dissonant warning brass sting
   */
  public playThokoBoom(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      // 1. Heavy sub-bass drop (shockwave impact)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.48);

      const subFilter = ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(280, now);
      subFilter.frequency.exponentialRampToValueAtTime(60, now + 0.48);

      subGain.gain.setValueAtTime(0.38, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(dest);

      subOsc.start(now);
      subOsc.stop(now + 0.54);

      // 2. Punchy impact transient slap
      const slapBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
      const slapData = slapBuffer.getChannelData(0);
      for (let i = 0; i < slapData.length; i++) {
        slapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (slapData.length * 0.2));
      }
      const slapNoise = ctx.createBufferSource();
      slapNoise.buffer = slapBuffer;

      const slapFilter = ctx.createBiquadFilter();
      slapFilter.type = 'bandpass';
      slapFilter.frequency.setValueAtTime(800, now);
      slapFilter.Q.setValueAtTime(1.5, now);

      const slapGain = ctx.createGain();
      slapGain.gain.setValueAtTime(0.32, now);
      slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      slapNoise.connect(slapFilter);
      slapFilter.connect(slapGain);
      slapGain.connect(dest);
      slapNoise.start(now);

      // 3. Staggered ominous dissonant warning sting chords (Eb4, G4, Bb4, Db5)
      const warningNotes = [311.13, 392.0, 466.16, 554.37];
      warningNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.025);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now + idx * 0.025);
        filter.frequency.exponentialRampToValueAtTime(400, now + idx * 0.025 + 0.38);

        gain.gain.setValueAtTime(0.14, now + idx * 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.025 + 0.38);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.025);
        osc.stop(now + idx * 0.025 + 0.4);
      });
    } catch (e) {}
  }

  /**
   * Smooth trick win & card sweep sound
   * Gathering cards into pile + warm ascending crystal chime
   */
  public playTrickSweep(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      // 1. Scoop / paper gathering whoosh
      const sweepDur = 0.16;
      const sweepBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sweepDur), ctx.sampleRate);
      const sweepData = sweepBuffer.getChannelData(0);
      for (let i = 0; i < sweepData.length; i++) {
        sweepData[i] = Math.random() * 2 - 1;
      }
      const sweepNoise = ctx.createBufferSource();
      sweepNoise.buffer = sweepBuffer;

      const sweepFilter = ctx.createBiquadFilter();
      sweepFilter.type = 'bandpass';
      sweepFilter.frequency.setValueAtTime(1400, now);
      sweepFilter.frequency.exponentialRampToValueAtTime(500, now + sweepDur);
      sweepFilter.Q.setValueAtTime(2.0, now);

      const sweepGain = ctx.createGain();
      sweepGain.gain.setValueAtTime(0.14, now);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + sweepDur);

      sweepNoise.connect(sweepFilter);
      sweepFilter.connect(sweepGain);
      sweepGain.connect(dest);
      sweepNoise.start(now);

      // 2. Pleasant ascending major triad chime (C5, E5, G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.28);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.3);
      });
    } catch (e) {}
  }

  /**
   * Attention chime alerting user that it is their turn to play
   * Dual marimba ping (F5 -> C6)
   */
  public playYourTurn(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      const notes = [698.46, 1046.5]; // F5, C6
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.085;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch (e) {}
  }

  /**
   * Triumphant Got Away celebration fanfare
   * Ascending trumpet-like arpeggio (C5 -> E5 -> G5 -> C6 -> E6)
   */
  public playGetAwayFanfare(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, i) => {
        const t = now + i * 0.075;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = i === notes.length - 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        // High shimmer sustain on the final note
        const sustain = i === notes.length - 1 ? 0.65 : 0.32;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + sustain);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + sustain + 0.02);
      });
    } catch (e) {}
  }

  /**
   * Bhabhi loser announcement / game over
   * Playful sad slide down (G4 -> F#4 -> F4 -> Eb4) with comical wobble
   */
  public playBhabhiGameOver(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      const notes = [392.0, 369.99, 349.23, 311.13]; // G4, F#4, F4, Eb4
      notes.forEach((freq, i) => {
        const t = now + i * 0.22;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        // Comical slide down on the last sad note
        if (i === notes.length - 1) {
          osc.frequency.exponentialRampToValueAtTime(261.63, t + 0.6); // slide down to C4
        }

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, t);

        const duration = i === notes.length - 1 ? 0.65 : 0.28;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + duration + 0.02);
      });
    } catch (e) {}
  }

  /**
   * Rapid card dealing flutter (casino dealer riffle)
   */
  public playDealCards(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      const totalDeals = 8;
      for (let i = 0; i < totalDeals; i++) {
        const t = now + i * 0.045;
        const jitter = (Math.random() - 0.5) * 120;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450 + jitter, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.035);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.04);
      }
    } catch (e) {}
  }

  /**
   * Gentle water drop bubble pop for chat messages
   */
  public playChatPop(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  /**
   * Low dull tap for invalid moves or out-of-turn clicks
   */
  public playInvalid(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dest = this.getDestinationNode(ctx);

      [180, 130].forEach((freq, idx) => {
        const t = now + idx * 0.065;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.06);
      });
    } catch (e) {}
  }
}

export const bhabhiSounds = new BhabhiSoundFX();
