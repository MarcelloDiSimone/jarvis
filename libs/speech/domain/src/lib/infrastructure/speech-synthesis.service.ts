import { Injectable } from '@angular/core';
import {
  defer,
  fromEventPattern,
  Observable,
  of,
  race,
  shareReplay,
  switchMap,
  take,
  tap,
  throwError,
  timer,
} from 'rxjs';

export type SpeechVoicePreference = {
  lang?: string;
  name: string;
  pitch: number;
  rate: number;
};

const DEFAULT_VOICE_PREFERENCE: SpeechVoicePreference = {
  name: 'Zarvox',
  lang: 'en-US',
  pitch: 0.7,
  rate: 0.9,
};

@Injectable({ providedIn: 'root' })
export class SpeechSynthesisService {
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private voice$: Observable<SpeechSynthesisVoice | null> | null = null;
  private voicePreference = DEFAULT_VOICE_PREFERENCE;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  setVoicePreference(preference: SpeechVoicePreference): void {
    this.voicePreference = { ...preference };
    this.selectedVoice = null;
    this.voice$ = null;
  }

  speak(text: string): Observable<void> {
    return defer(() => {
      const trimmedText = text.trim();

      if (!this.isSupported()) {
        console.log('[speech-synthesis] Speech synthesis is not supported.');
        return throwError(
          () => new Error('Speech synthesis is not supported in this browser.'),
        );
      }

      if (!trimmedText) {
        console.log(
          '[speech-synthesis] No text provided for speech synthesis.',
        );
        return throwError(
          () => new Error('Speech synthesis requires text to read.'),
        );
      }

      this.stop();

      return this.getSelectedVoice().pipe(
        switchMap((voice) => this.speakWithVoice(trimmedText, voice)),
      );
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

  private createUtterance(
    text: string,
    voice: SpeechSynthesisVoice | null,
  ): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.pitch = this.voicePreference.pitch;
    utterance.rate = this.voicePreference.rate;

    return utterance;
  }

  private getSelectedVoice(): Observable<SpeechSynthesisVoice | null> {
    if (this.selectedVoice) {
      return of(this.selectedVoice);
    }

    const preference = this.voicePreference;

    this.voice$ ??= this.loadVoice(preference).pipe(
      tap((voice) => {
        if (this.voicePreference === preference) {
          this.selectedVoice = voice;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.voice$;
  }

  private loadVoice(
    preference: SpeechVoicePreference,
  ): Observable<SpeechSynthesisVoice | null> {
    return defer(() => {
      const existingVoice = this.findVoice(preference);
      if (existingVoice) {
        return of(existingVoice);
      }

      return race(this.voicesChanged(), timer(1000)).pipe(
        take(1),
        switchMap(() =>
          of(
            this.findVoice(preference) ??
              window.speechSynthesis.getVoices()[0] ??
              null,
          ),
        ),
      );
    });
  }

  private speakWithVoice(
    text: string,
    voice: SpeechSynthesisVoice | null,
  ): Observable<void> {
    return new Observable<void>((subscriber) => {
      const utterance = this.createUtterance(text, voice);
      let finished = false;

      utterance.onstart = () => {
        console.log('[speech-synthesis] Speech started:', text);
      };

      utterance.onend = () => {
        finished = true;
        this.clearUtterance(utterance);
        console.log('[speech-synthesis] Speech ended:', text);
        subscriber.next();
        subscriber.complete();
      };

      utterance.onerror = (event) => {
        finished = true;
        this.clearUtterance(utterance);

        const error = new Error(
          event.error || 'Speech synthesis playback failed.',
        );
        console.log('[speech-synthesis] Speech failed:', error.message);
        subscriber.error(error);
      };

      this.utterance = utterance;
      window.speechSynthesis.speak(utterance);

      return () => {
        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;

        if (this.utterance === utterance) {
          this.utterance = null;
        }

        if (!finished && this.isSupported()) {
          window.speechSynthesis.cancel();
        }
      };
    });
  }

  private clearUtterance(utterance: SpeechSynthesisUtterance): void {
    if (this.utterance === utterance) {
      this.utterance = null;
    }
  }

  private voicesChanged(): Observable<Event> {
    return fromEventPattern<Event>(
      (handler) => {
        window.speechSynthesis.addEventListener('voiceschanged', handler, {
          once: true,
        });
      },
      (handler) => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
      },
    );
  }

  private findVoice(
    preference: SpeechVoicePreference,
  ): SpeechSynthesisVoice | null {
    return (
      window.speechSynthesis
        .getVoices()
        .find(
          (voice) =>
            voice.name.startsWith(preference.name) &&
            (!preference.lang || voice.lang === preference.lang),
        ) ?? null
    );
  }
}
