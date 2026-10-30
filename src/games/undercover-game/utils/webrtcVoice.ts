/**
 * WebRTC Real-Time Voice Chat Engine in TypeScript
 * Features:
 * - Direct peer-to-peer audio transmission via RTCPeerConnection mesh
 * - STUN server discovery
 * - Local audio level analysis & speaking state detection
 * - Remote audio element generation with autoplay & auto-resume
 * - Mute / Unmute and volume synchronization
 */

export interface PeerVoiceState {
  isMuted: boolean;
  isSpeaking: boolean;
  volume: number;
}

export interface VoiceSnapshot {
  hasPermission: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  currentVolume: number;
  peerStates: Record<string, PeerVoiceState>;
}

export type VoiceListener = (snapshot: VoiceSnapshot) => void;
export type SignalSender = (targetPlayerId: string, signal: unknown) => void;
export type StatusBroadcaster = (status: { isMuted: boolean; isSpeaking: boolean; volume: number }) => void;

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

class WebRTCVoiceManager {
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  public isMuted: boolean = false;
  public hasPermission: boolean = false;
  public isSpeaking: boolean = false;
  public currentVolume: number = 0;
  private listeners: Set<VoiceListener> = new Set();
  public peerStates: Record<string, PeerVoiceState> = {};
  private animationFrameId: number | null = null;

  // WebRTC Peer Mesh Networking
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteAudios: Map<string, HTMLAudioElement> = new Map();
  private myPlayerId: string | null = null;
  private sendSignalCallback: SignalSender | null = null;
  private broadcastStatusCallback: StatusBroadcaster | null = null;

  /**
   * Configure signaling callbacks provided by the active multiplayer socket/engine
   */
  public setSignaling(
    myPlayerId: string,
    sendSignal: SignalSender,
    broadcastStatus: StatusBroadcaster
  ): void {
    this.myPlayerId = myPlayerId;
    this.sendSignalCallback = sendSignal;
    this.broadcastStatusCallback = broadcastStatus;
  }

  /**
   * Request microphone permissions & initialize local audio analysis
   */
  public async requestMicrophone(): Promise<{ success: boolean; stream?: MediaStream; error?: string }> {
    if (this.localStream) {
      return { success: true, stream: this.localStream };
    }

    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC Voice is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.localStream = stream;
      this.hasPermission = true;
      this.isMuted = false;

      this.setupAudioAnalysis(stream);

      // Add audio tracks to all existing peer connections
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        this.peerConnections.forEach((pc) => {
          const senders = pc.getSenders();
          const hasAudio = senders.some((s) => s.track && s.track.kind === 'audio');
          if (!hasAudio) {
            pc.addTrack(audioTrack, stream);
          }
        });
      }

      this.broadcastLocalStatus();
      this.notify();
      return { success: true, stream };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      console.warn('Microphone access denied or unavailable:', msg);
      this.hasPermission = false;
      this.notify();
      return { success: false, error: msg };
    }
  }

  /**
   * Real-time audio spectrum & speaking analysis
   */
  private setupAudioAnalysis(stream: MediaStream): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let lastBroadcastTime = 0;

      const analyzeAudio = () => {
        if (!this.analyser || this.isMuted || !this.localStream) {
          if (this.currentVolume !== 0 || this.isSpeaking) {
            this.currentVolume = 0;
            this.isSpeaking = false;
            this.notify();
            this.broadcastLocalStatus();
          }
          this.animationFrameId = requestAnimationFrame(analyzeAudio);
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        const speakingNow = normalized > 16;

        const statusChanged = this.isSpeaking !== speakingNow;
        this.currentVolume = normalized;
        this.isSpeaking = speakingNow;

        const now = Date.now();
        if (statusChanged || (speakingNow && now - lastBroadcastTime > 300)) {
          lastBroadcastTime = now;
          this.broadcastLocalStatus();
        }

        this.notify();
        this.animationFrameId = requestAnimationFrame(analyzeAudio);
      };

      analyzeAudio();
    } catch (e) {
      console.warn('Failed to setup Web Audio analysis:', e);
    }
  }

  /**
   * Broadcast local speaking / volume status to peers
   */
  private broadcastLocalStatus(): void {
    if (this.broadcastStatusCallback) {
      this.broadcastStatusCallback({
        isMuted: this.isMuted,
        isSpeaking: this.isSpeaking,
        volume: this.currentVolume,
      });
    }
  }

  /**
   * Ensure audio context is running on user interaction
   */
  public resumeAudioContext(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    // Also try playing any stalled remote audio elements
    this.remoteAudios.forEach((audio) => {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    });
  }

  /**
   * Synchronize active peers in room: creates peer connections and initiates calls
   */
  public syncPeers(peerIds: string[]): void {
    if (!this.myPlayerId) return;

    // Remove peers that have left
    for (const [pid, pc] of this.peerConnections.entries()) {
      if (!peerIds.includes(pid)) {
        pc.close();
        this.peerConnections.delete(pid);
        this.removeRemoteAudio(pid);
        delete this.peerStates[pid];
      }
    }

    // Connect to new peers
    peerIds.forEach((pid) => {
      if (pid === this.myPlayerId) return;
      if (!this.peerConnections.has(pid)) {
        this.createPeerConnection(pid);
      }
    });

    this.notify();
  }

  /**
   * Creates an RTCPeerConnection for a given peer
   */
  private createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(peerId, pc);

    // Attach local audio track if available
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        pc.addTrack(audioTrack, this.localStream);
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.sendSignalCallback) {
        this.sendSignalCallback(peerId, {
          type: 'candidate',
          candidate: event.candidate,
        });
      }
    };

    // Handle remote track arrival
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0] || new MediaStream([event.track]);
      this.attachRemoteAudio(peerId, remoteStream);
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        this.updatePeerState(peerId, { isSpeaking: false, volume: 0 });
      }
    };

    // Polite peer pattern: peer with alphabetically higher ID initiates offer
    if (this.myPlayerId && this.myPlayerId > peerId) {
      pc.createOffer({ offerToReceiveAudio: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (this.sendSignalCallback && pc.localDescription) {
            this.sendSignalCallback(peerId, {
              type: 'offer',
              sdp: pc.localDescription,
            });
          }
        })
        .catch((e) => console.warn(`Failed to create offer to ${peerId}:`, e));
    }

    return pc;
  }

  /**
   * Handle incoming WebRTC signaling (offers, answers, candidates)
   */
  public async handleIncomingSignal(fromPlayerId: string, signal: unknown): Promise<void> {
    const sig = signal as { type: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };
    if (!sig || !sig.type) return;

    let pc = this.peerConnections.get(fromPlayerId);
    if (!pc) {
      pc = this.createPeerConnection(fromPlayerId);
    }

    try {
      if (sig.type === 'offer' && sig.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(sig.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        if (this.sendSignalCallback && pc.localDescription) {
          this.sendSignalCallback(fromPlayerId, {
            type: 'answer',
            sdp: pc.localDescription,
          });
        }
      } else if (sig.type === 'answer' && sig.sdp) {
        if (pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(sig.sdp));
        }
      } else if (sig.type === 'candidate' && sig.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(sig.candidate));
        } catch (e) {
          console.warn('Error adding ICE candidate:', e);
        }
      }
    } catch (err) {
      console.warn(`WebRTC signal handling error from ${fromPlayerId}:`, err);
    }
  }

  /**
   * Attach remote audio stream to a playback element
   */
  private attachRemoteAudio(peerId: string, stream: MediaStream): void {
    let audio = this.remoteAudios.get(peerId);
    if (!audio) {
      audio = document.createElement('audio');
      audio.autoplay = true;
      audio.setAttribute('playsinline', 'true');
      audio.style.display = 'none';
      document.body.appendChild(audio);
      this.remoteAudios.set(peerId, audio);
    }

    audio.srcObject = stream;
    audio.play().catch(() => {
      // Browser autoplay policy might require user gesture
    });
  }

  /**
   * Remove remote audio element
   */
  private removeRemoteAudio(peerId: string): void {
    const audio = this.remoteAudios.get(peerId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      if (audio.parentNode) {
        audio.parentNode.removeChild(audio);
      }
      this.remoteAudios.delete(peerId);
    }
  }

  /**
   * Toggle mute on local microphone
   */
  public toggleMute(): boolean {
    this.resumeAudioContext();

    if (!this.localStream) {
      this.isMuted = !this.isMuted;
      this.broadcastLocalStatus();
      this.notify();
      return this.isMuted;
    }

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      this.isMuted = !this.isMuted;
      audioTrack.enabled = !this.isMuted;
      if (this.isMuted) {
        this.currentVolume = 0;
        this.isSpeaking = false;
      }
      this.broadcastLocalStatus();
      this.notify();
    }
    return this.isMuted;
  }

  public setMute(muted: boolean): void {
    this.resumeAudioContext();

    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !muted;
      }
    }
    this.isMuted = muted;
    if (muted) {
      this.currentVolume = 0;
      this.isSpeaking = false;
    }
    this.broadcastLocalStatus();
    this.notify();
  }

  /**
   * Stop all voice activities, audio tracks, and peer connections
   */
  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }

    // Close all peer connections
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();

    // Remove remote audio elements
    this.remoteAudios.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
      if (audio.parentNode) audio.parentNode.removeChild(audio);
    });
    this.remoteAudios.clear();

    this.hasPermission = false;
    this.currentVolume = 0;
    this.isSpeaking = false;
    this.peerStates = {};
    this.broadcastLocalStatus();
    this.notify();
  }

  public updatePeerState(playerId: string, state: Partial<PeerVoiceState>): void {
    this.peerStates[playerId] = {
      ...(this.peerStates[playerId] || { isMuted: false, isSpeaking: false, volume: 0 }),
      ...state,
    };
    this.notify();
  }

  public removePeer(playerId: string): void {
    delete this.peerStates[playerId];
    const pc = this.peerConnections.get(playerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(playerId);
    }
    this.removeRemoteAudio(playerId);
    this.notify();
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify(): void {
    const snapshot: VoiceSnapshot = {
      hasPermission: this.hasPermission,
      isMuted: this.isMuted,
      isSpeaking: this.isSpeaking,
      currentVolume: this.currentVolume,
      peerStates: { ...this.peerStates },
    };
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export const webrtcVoice = new WebRTCVoiceManager();
