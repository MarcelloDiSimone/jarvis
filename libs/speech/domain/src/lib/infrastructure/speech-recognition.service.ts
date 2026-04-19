import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
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

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private recognition: SpeechRecognitionLike | null = null;

  isSupported(): boolean {
    return this.getRecognitionConstructor() !== null;
  }

  recordOnce(): Observable<string> {
    return new Observable<string>((subscriber) => {
      const SpeechRecognitionClass = this.getRecognitionConstructor();

      if (!SpeechRecognitionClass) {
        subscriber.error(new Error('Speech recognition is not supported in this browser.'));
        return;
      }

      const recognition = new SpeechRecognitionClass();
      this.recognition = recognition;

      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim() ?? '';
        if (transcript) {
          subscriber.next(transcript);
        }
      };

      recognition.onerror = (event) => {
        subscriber.error(new Error(event.error));
      };

      recognition.onend = () => {
        this.recognition = null;
        subscriber.complete();
      };

      recognition.start();

      return () => {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
        if (this.recognition === recognition) {
          this.recognition = null;
        }
      };
    });
  }

  stop(): void {
    this.recognition?.stop();
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
