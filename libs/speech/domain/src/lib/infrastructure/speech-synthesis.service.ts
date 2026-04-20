import { Injectable } from '@angular/core';

type SpeechSynthesisCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
};

@Injectable({ providedIn: 'root' })
export class SpeechSynthesisService {
  private utterance: SpeechSynthesisUtterance | null = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  async speak(
    text: string,
    callbacks: SpeechSynthesisCallbacks = {},
  ): Promise<void> {
    const trimmedText = text.trim();

    if (!this.isSupported()) {
      console.log('[speech-synthesis] Speech synthesis is not supported.');
      callbacks.onError?.(
        new Error('Speech synthesis is not supported in this browser.'),
      );
      return;
    }

    if (!trimmedText) {
      console.log('[speech-synthesis] No text provided for speech synthesis.');
      callbacks.onError?.(new Error('Speech synthesis requires text to read.'));
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(trimmedText);
    const voice = await this.getVoiceByName('Grandpa');

    if (voice) {
      utterance.voice = voice;
    }
    utterance.pitch = 0.7;
    utterance.rate = 0.9;

    await new Promise<void>((resolve, reject) => {
      utterance.onstart = () => {
        console.log('[speech-synthesis] Speech started:', trimmedText);
        callbacks.onStart?.();
      };

      utterance.onend = () => {
        if (this.utterance === utterance) {
          this.utterance = null;
        }
        console.log('[speech-synthesis] Speech ended:', trimmedText);
        callbacks.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        if (this.utterance === utterance) {
          this.utterance = null;
        }

        const error = new Error(
          event.error || 'Speech synthesis playback failed.',
        );
        console.log('[speech-synthesis] Speech failed:', error.message);
        callbacks.onError?.(error);
        reject(error);
      };

      this.utterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (!this.isSupported()) {
      return;
    }

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    this.utterance = null;
  }

  private async getVoiceByName(
    name: string,
  ): Promise<SpeechSynthesisVoice | null> {
    const existingVoice = this.findVoiceByName(name);
    if (existingVoice) {
      return existingVoice;
    }

    await new Promise<void>((resolve) => {
      const synthesis = window.speechSynthesis;

      const handleVoicesChanged = () => {
        synthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve();
      };

      synthesis.addEventListener('voiceschanged', handleVoicesChanged, {
        once: true,
      });

      window.setTimeout(() => {
        synthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve();
      }, 1000);
    });

    return (
      this.findVoiceByName(name) ??
      window.speechSynthesis.getVoices()[0] ??
      null
    );
  }

  private findVoiceByName(name: string): SpeechSynthesisVoice | null {
    return (
      window.speechSynthesis.getVoices().find((voice) => voice.name === name) ??
      null
    );
  }
}
