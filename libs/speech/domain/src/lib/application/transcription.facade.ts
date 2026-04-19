import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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

  toggleRecording(): void {
    if (!this.isSupported()) {
      this.statusMessageSubject.next(
        'Speech recognition is not supported in this browser.',
      );
      return;
    }

    if (this.isRecordingSubject.value) {
      this.speechRecognition.stop();
      this.isRecordingSubject.next(false);
      this.statusMessageSubject.next('Recording stopped.');
      return;
    }

    this.speechRecognition.start({
      initialTranscript: this.activeTranscriptSubject.value,
      onStart: () => {
        this.isRecordingSubject.next(true);
        this.statusMessageSubject.next('Listening for speech...');
      },
      onResult: (transcript) => {
        this.activeTranscriptSubject.next(transcript);
        this.statusMessageSubject.next('Transcript updated.');
      },
      onEnd: () => {
        this.isRecordingSubject.next(false);
        this.statusMessageSubject.next('Recording complete.');
      },
      onError: (error) => {
        this.isRecordingSubject.next(false);
        this.statusMessageSubject.next(`Recognition failed: ${error.message}`);
      },
    });
  }

  updateTranscript(transcript: string): void {
    this.activeTranscriptSubject.next(transcript);
  }
}
