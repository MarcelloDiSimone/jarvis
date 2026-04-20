import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AI_COMMAND_GATEWAY } from './ai-command.gateway';
import { SpeechRecognitionService } from '../infrastructure/speech-recognition.service';
import { SpeechSynthesisService } from '../infrastructure/speech-synthesis.service';

const WAKE_WORD = 'jarvis';
const WAKE_WORD_MAX_DISTANCE = 2;
const WAKE_WORD_ALIASES = [
  'jarvise',
  'jervis',
  'jarviss',
  'jarvez',
  'jarvish',
  'javis',
  'javish',
  'charvice',
  'chavis',
  'travis',
  'service',
];
const SLEEP_COMMAND = 'go to sleep';
const SLEEP_RESPONSE = 'Good night.';
const ACKNOWLEDGEMENT = 'Yes, my master';
const FAILURE_RESPONSE = "Sorry Dave, I can't do this.";
const COMMAND_PAUSE_MS = 1200;

export type VoiceState = 'inactive' | 'waiting' | 'recording';

type TranscriptionMode =
  | 'idle'
  | 'wake-listening'
  | 'acknowledging'
  | 'command-listening';

@Injectable({ providedIn: 'root' })
export class TranscriptionFacade {
  private readonly speechRecognition = inject(SpeechRecognitionService);
  private readonly speechSynthesis = inject(SpeechSynthesisService);
  private readonly aiCommandGateway = inject(AI_COMMAND_GATEWAY, { optional: true });
  private readonly activeTranscriptSubject = new BehaviorSubject<string>('');
  private readonly isRecordingSubject = new BehaviorSubject<boolean>(false);
  private readonly statusMessageSubject = new BehaviorSubject<string>(
    'Waiting for "Jarvis"...',
  );
  private readonly voiceStateSubject = new BehaviorSubject<VoiceState>('inactive');
  private mode: TranscriptionMode = 'idle';
  private pendingTranscript = '';
  private silenceTimeoutId: number | null = null;

  readonly activeTranscript$ = this.activeTranscriptSubject.asObservable();
  readonly isRecording$ = this.isRecordingSubject.asObservable();
  readonly statusMessage$ = this.statusMessageSubject.asObservable();
  readonly voiceState$ = this.voiceStateSubject.asObservable();

  isSupported(): boolean {
    return this.speechRecognition.isSupported();
  }

  start(): void {
    if (!this.isSupported()) {
      this.voiceStateSubject.next('inactive');
      this.statusMessageSubject.next(
        'Speech recognition is not supported in this browser.',
      );
      return;
    }

    if (this.mode !== 'idle') {
      return;
    }

    this.isRecordingSubject.next(true);
    this.startWakeWordListening();
  }

  stop(): void {
    this.clearSilenceTimeout();
    this.mode = 'idle';
    this.pendingTranscript = '';
    this.speechRecognition.stop();
    this.speechSynthesis.stop();
    this.isRecordingSubject.next(false);
    this.voiceStateSubject.next('inactive');
    this.statusMessageSubject.next('Voice control stopped.');
  }

  updateTranscript(transcript: string): void {
    this.activeTranscriptSubject.next(transcript);
  }

  reactivate(): void {
    this.start();
  }

  private startWakeWordListening(): void {
    this.clearSilenceTimeout();
    this.mode = 'wake-listening';
    this.statusMessageSubject.next('Waiting for "Jarvis"...');
    this.voiceStateSubject.next('waiting');

    this.speechRecognition.start(
      {
        onResult: (transcript) => {
          if (!this.containsWakeWord(transcript)) {
            return;
          }

          this.speechRecognition.stop();
          this.startCommandListening();
          void this.speakAcknowledgement();
        },
        onEnd: () => {
          if (this.mode === 'wake-listening') {
            this.startWakeWordListening();
          }
        },
        onError: (error) => {
          this.statusMessageSubject.next(`Recognition failed: ${error.message}`);

          if (this.mode === 'wake-listening') {
            this.startWakeWordListening();
          }
        },
      },
      {
        continuous: true,
        interimResults: true,
      },
    );
  }

  private startCommandListening(): void {
    this.clearSilenceTimeout();
    this.pendingTranscript = '';
    this.mode = 'command-listening';
    this.statusMessageSubject.next('Listening for your command...');
    this.voiceStateSubject.next('recording');

    this.speechRecognition.start(
      {
        onResult: (transcript) => {
          this.pendingTranscript = this.stripWakeWord(transcript);

          if (!this.pendingTranscript) {
            return;
          }

          this.restartSilenceTimeout();
        },
        onEnd: () => {
          if (this.mode === 'command-listening') {
            this.finishCommandCapture();
          }
        },
        onError: (error) => {
          this.clearSilenceTimeout();
          this.statusMessageSubject.next(`Recognition failed: ${error.message}`);
          this.startWakeWordListening();
        },
      },
      {
        continuous: true,
        interimResults: true,
      },
    );
  }

  private async speakAcknowledgement(): Promise<void> {
    if (!this.speechSynthesis.isSupported()) {
      return;
    }

    try {
      await this.speechSynthesis.speak(ACKNOWLEDGEMENT);
    } catch {
      if (this.mode === 'command-listening') {
        this.statusMessageSubject.next('Listening for your command...');
      }
    }
  }

  private finishCommandCapture(): void {
    this.clearSilenceTimeout();

    if (this.mode !== 'command-listening') {
      return;
    }

    const transcript = this.pendingTranscript.trim();
    this.pendingTranscript = '';

    if (transcript) {
      this.activeTranscriptSubject.next(transcript);
      this.statusMessageSubject.next('Command captured. Sending to backend...');
      this.voiceStateSubject.next('waiting');
      void this.handleCommand(transcript);
      return;
    }

    this.statusMessageSubject.next('No command detected. Waiting for "Jarvis"...');
    this.startWakeWordListening();
  }

  private restartSilenceTimeout(): void {
    this.clearSilenceTimeout();
    this.silenceTimeoutId = window.setTimeout(() => {
      if (this.mode !== 'command-listening') {
        return;
      }

      this.speechRecognition.stop();
      this.finishCommandCapture();
    }, COMMAND_PAUSE_MS);
  }

  private clearSilenceTimeout(): void {
    if (this.silenceTimeoutId === null) {
      return;
    }

    clearTimeout(this.silenceTimeoutId);
    this.silenceTimeoutId = null;
  }

  private containsWakeWord(transcript: string): boolean {
    return this.getWakeWordTokens(transcript).length > 0;
  }

  private stripWakeWord(transcript: string): string {
    const tokens = transcript
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    return tokens
      .filter((token) => !this.isWakeWordMatch(token))
      .join(' ')
      .trim();
  }

  private getWakeWordTokens(transcript: string): string[] {
    return transcript
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .filter((token) => this.isWakeWordMatch(token));
  }

  private isWakeWordMatch(token: string): boolean {
    const normalizedToken = this.normalizeToken(token);
    if (!normalizedToken) {
      return false;
    }

    return (
      normalizedToken === WAKE_WORD ||
      WAKE_WORD_ALIASES.includes(normalizedToken) ||
      this.calculateLevenshteinDistance(normalizedToken, WAKE_WORD) <=
        WAKE_WORD_MAX_DISTANCE
    );
  }

  private normalizeToken(token: string): string {
    return token.toLocaleLowerCase().replace(/[^a-z]/g, '');
  }

  private calculateLevenshteinDistance(source: string, target: string): number {
    if (source === target) {
      return 0;
    }

    if (!source.length) {
      return target.length;
    }

    if (!target.length) {
      return source.length;
    }

    const previousRow = Array.from({ length: target.length + 1 }, (_, index) => index);
    const readPreviousRow = (index: number): number => {
      const value = previousRow[index];

      if (value === undefined) {
        throw new Error('Levenshtein row index out of bounds.');
      }

      return value;
    };

    for (let sourceIndex = 0; sourceIndex < source.length; sourceIndex += 1) {
      let currentDiagonal = readPreviousRow(0);
      previousRow[0] = sourceIndex + 1;

      for (let targetIndex = 0; targetIndex < target.length; targetIndex += 1) {
        const nextDiagonal = readPreviousRow(targetIndex + 1);
        const cost = source[sourceIndex] === target[targetIndex] ? 0 : 1;

        previousRow[targetIndex + 1] = Math.min(
          readPreviousRow(targetIndex + 1) + 1,
          readPreviousRow(targetIndex) + 1,
          currentDiagonal + cost,
        );

        currentDiagonal = nextDiagonal;
      }
    }

    return readPreviousRow(target.length);
  }

  private async handleCommand(transcript: string): Promise<void> {
    if (this.isSleepCommand(transcript)) {
      await this.respondToSleepCommand();
      return;
    }

    try {
      if (!this.aiCommandGateway) {
        throw new Error('AI command gateway is not configured.');
      }

      const response = await this.aiCommandGateway.sendCommand({
        message: transcript,
      });
      const responseMessage = response.message || 'Done.';

      this.mode = 'acknowledging';
      this.statusMessageSubject.next(`Backend replied: ${responseMessage}`);
      await this.speakBackendResponse(responseMessage);
    } catch {
      this.mode = 'acknowledging';
      this.statusMessageSubject.next('Backend unavailable. Responding locally...');
      await this.speakFailureResponse();
    }

    this.startWakeWordListening();
  }

  private async speakBackendResponse(response: string): Promise<void> {
    if (!this.speechSynthesis.isSupported()) {
      return;
    }

    try {
      await this.speechSynthesis.speak(response);
    } catch {
      this.statusMessageSubject.next(`Backend replied: ${response}`);
    }
  }

  private stopForSleep(): void {
    this.clearSilenceTimeout();
    this.mode = 'idle';
    this.pendingTranscript = '';
    this.speechRecognition.stop();
    this.speechSynthesis.stop();
    this.isRecordingSubject.next(false);
    this.voiceStateSubject.next('inactive');
    this.statusMessageSubject.next('Sleeping. Press Reactivate to resume listening.');
  }

  private async respondToSleepCommand(): Promise<void> {
    this.clearSilenceTimeout();
    this.mode = 'idle';
    this.pendingTranscript = '';
    this.speechRecognition.stop();
    this.isRecordingSubject.next(false);
    this.voiceStateSubject.next('inactive');
    this.statusMessageSubject.next(SLEEP_RESPONSE);

    if (this.speechSynthesis.isSupported()) {
      try {
        await this.speechSynthesis.speak(SLEEP_RESPONSE, {
          onStart: () => {
            this.statusMessageSubject.next(SLEEP_RESPONSE);
          },
        });
      } catch {
        this.statusMessageSubject.next(SLEEP_RESPONSE);
      }
    }

    this.statusMessageSubject.next('Sleeping. Press Reactivate to resume listening.');
  }

  private isSleepCommand(transcript: string): boolean {
    return this.normalizePhrase(transcript).includes(SLEEP_COMMAND);
  }

  private normalizePhrase(transcript: string): string {
    return transcript
      .toLocaleLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async speakFailureResponse(): Promise<void> {
    if (!this.speechSynthesis.isSupported()) {
      this.statusMessageSubject.next(FAILURE_RESPONSE);
      return;
    }

    try {
      await this.speechSynthesis.speak(FAILURE_RESPONSE, {
        onStart: () => {
          this.statusMessageSubject.next(FAILURE_RESPONSE);
        },
      });
    } catch {
      this.statusMessageSubject.next(FAILURE_RESPONSE);
    }
  }
}
