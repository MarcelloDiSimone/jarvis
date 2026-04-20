/// <reference types="dom-speech-recognition" />

import { Injectable } from '@angular/core';

type SpeechRecognitionCallbacks = {
  onStart?: () => void;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
};

type SpeechRecognitionOptions = {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognition;

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;

  isSupported(): boolean {
    return this.getRecognitionConstructor() !== null;
  }

  start(
    callbacks: SpeechRecognitionCallbacks,
    options: SpeechRecognitionOptions = {},
  ): void {
    const SpeechRecognitionClass = this.getRecognitionConstructor();

    if (!SpeechRecognitionClass) {
      callbacks.onError?.(
        new Error('Speech recognition is not supported in this browser.')
      );
      return;
    }

    this.stop();

    const recognition = new SpeechRecognitionClass();
    this.recognition = recognition;

    recognition.continuous = options.continuous ?? true;
    recognition.lang = options.lang ?? 'en-US';
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript?.trim() ?? '')
        .filter(Boolean)
        .join(' ')
        .trim();

      if (transcript) {
        console.log('[speech-recognition] Speech received:', transcript);
      } else {
        console.log('[speech-recognition] Speech event received, but no transcript was recognized.');
      }

      callbacks.onResult?.(transcript);
    };

    recognition.onerror = (event) => {
      console.log('[speech-recognition] Speech could not be recognized:', event.error);
      callbacks.onError?.(new Error(event.error));
    };

    recognition.onend = () => {
      if (this.recognition === recognition) {
        this.recognition = null;
      }
      callbacks.onEnd?.();
    };

    recognition.start();
    callbacks.onStart?.();
  }

  stop(): void {
    const recognition = this.recognition;
    if (!recognition) {
      return;
    }

    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.stop();
    this.recognition = null;
  }

  private getRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
    if (typeof SpeechRecognition !== 'undefined') {
      return SpeechRecognition;
    }

    if (typeof webkitSpeechRecognition !== 'undefined') {
      return webkitSpeechRecognition;
    }

    return null;
  }
}
