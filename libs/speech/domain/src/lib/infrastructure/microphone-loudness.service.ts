import { Injectable, signal } from '@angular/core';

const LOUDNESS_BOOST = 4;

type WindowWithWebkitAudioContext = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function calculateLoudness(samples: Uint8Array<ArrayBufferLike>): number {
  if (samples.length === 0) {
    return 0;
  }

  let sum = 0;

  for (const sample of samples) {
    const normalizedSample = (sample - 128) / 128;
    sum += normalizedSample * normalizedSample;
  }

  const rms = Math.sqrt(sum / samples.length);

  return Math.min(1, rms * LOUDNESS_BOOST);
}

@Injectable({ providedIn: 'root' })
export class MicrophoneLoudnessService {
  private readonly loudnessSignal = signal(0);
  private audioContext: AudioContext | null = null;
  private animationFrameId: number | null = null;
  private analyser: AnalyserNode | null = null;
  private isStarting = false;
  private samples: Uint8Array<ArrayBuffer> | null = null;
  private startToken = 0;
  private stream: MediaStream | null = null;

  readonly loudness = this.loudnessSignal.asReadonly();

  async start(): Promise<void> {
    if (this.stream || this.isStarting) {
      return;
    }

    const startToken = this.startToken + 1;
    this.startToken = startToken;
    this.isStarting = true;

    if (
      typeof navigator === 'undefined' ||
      typeof window === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      this.loudnessSignal.set(0);
      this.isStarting = false;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (startToken !== this.startToken) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const AudioContextClass =
        window.AudioContext ??
        (window as WindowWithWebkitAudioContext).webkitAudioContext;

      if (!AudioContextClass) {
        stream.getTracks().forEach((track) => track.stop());
        this.loudnessSignal.set(0);
        return;
      }

      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      audioContext.createMediaStreamSource(stream).connect(analyser);

      this.stream = stream;
      this.audioContext = audioContext;
      this.analyser = analyser;
      this.samples = new Uint8Array(analyser.fftSize);
      this.updateLoudness();
    } catch {
      if (startToken === this.startToken) {
        this.stop();
      }
    } finally {
      if (startToken === this.startToken) {
        this.isStarting = false;
      }
    }
  }

  stop(): void {
    this.startToken += 1;
    this.isStarting = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.analyser = null;
    this.samples = null;
    this.loudnessSignal.set(0);

    const audioContext = this.audioContext;
    this.audioContext = null;
    void audioContext?.close().catch(() => undefined);
  }

  private updateLoudness(): void {
    const analyser = this.analyser;
    const samples = this.samples;

    if (!analyser || !samples) {
      return;
    }

    analyser.getByteTimeDomainData(samples);
    this.loudnessSignal.set(calculateLoudness(samples));

    this.animationFrameId = requestAnimationFrame(() => this.updateLoudness());
  }
}
