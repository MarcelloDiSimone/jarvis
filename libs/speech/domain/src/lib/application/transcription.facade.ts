import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import { SpeechRecognitionService } from '../infrastructure/speech-recognition.service';

@Injectable({ providedIn: 'root' })
export class TranscriptionFacade {
  private readonly speechRecognition = inject(SpeechRecognitionService);
  private readonly activeTranscriptSubject = new BehaviorSubject<string>('');
  private readonly isRecordingSubject = new BehaviorSubject<boolean>(false);
  private readonly statusMessageSubject = new BehaviorSubject<string>(
    'Click record and speak a short phrase.',
  );

  readonly activeTranscript$ = this.activeTranscriptSubject.asObservable();
  readonly isRecording$ = this.isRecordingSubject.asObservable();
  readonly statusMessage$ = this.statusMessageSubject.asObservable();

  isSupported(): boolean {
    return this.speechRecognition.isSupported();
  }

  startRecording(): void {
    if (!this.isSupported() || this.isRecordingSubject.value) {
      return;
    }

    this.isRecordingSubject.next(true);
    this.statusMessageSubject.next('Listening for speech...');

    this.speechRecognition
      .recordOnce()
      .pipe(finalize(() => this.isRecordingSubject.next(false)))
      .subscribe({
        next: (transcript) => {
          this.activeTranscriptSubject.next(transcript);
          this.statusMessageSubject.next('Recognition complete.');
        },
        error: (error: Error) => {
          this.statusMessageSubject.next(
            `Recognition failed: ${error.message}`,
          );
        },
      });
  }

  updateTranscript(transcript: string): void {
    this.activeTranscriptSubject.next(transcript);
  }
}
