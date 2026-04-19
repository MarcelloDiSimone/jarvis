import { Injectable } from '@angular/core';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal?: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

type SpeechRecognitionCallbacks = {
  initialTranscript?: string;
  onStart?: () => void;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
};

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private recognition: SpeechRecognitionLike | null = null;

  isSupported(): boolean {
    return this.getRecognitionConstructor() !== null;
  }

  start(callbacks: SpeechRecognitionCallbacks): void {
    const SpeechRecognitionClass = this.getRecognitionConstructor();

    if (!SpeechRecognitionClass) {
      callbacks.onError?.(
        new Error('Speech recognition is not supported in this browser.')
      );
      return;
    }

    this.stop();

    const recognition = new SpeechRecognitionClass();
    let transcript = callbacks.initialTranscript?.trim() ?? '';

    this.recognition = recognition;

    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript?.trim() ?? '')
        .filter(Boolean)
        .join(' ')
        .trim();

      callbacks.onResult?.(transcript);
    };

    recognition.onerror = (event) => {
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
    if (typeof window === 'undefined') {
      return null;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructorLike;
      webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    };

    return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
  }
}
