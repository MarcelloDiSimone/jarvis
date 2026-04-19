import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranscriptionFacade } from '@jarvis/speech/domain';
import { SpeechTranscriptFormComponent } from '@jarvis/speech/ui-common';

@Component({
  standalone: true,
  imports: [AsyncPipe, SpeechTranscriptFormComponent],
  selector: 'speech-feature-transcription-shell',
  templateUrl: './transcription.component.html',
  styleUrls: ['./transcription.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranscriptionComponent {
  private readonly transcriptionFacade = inject(TranscriptionFacade);
  protected readonly transcript$ = this.transcriptionFacade.activeTranscript$;
  protected readonly isRecording$ = this.transcriptionFacade.isRecording$;
  protected readonly statusMessage$ = this.transcriptionFacade.statusMessage$;
  protected readonly isSupported = this.transcriptionFacade.isSupported();

  protected startRecording(): void {
    this.transcriptionFacade.startRecording();
  }

  protected updateTranscript(transcript: string): void {
    this.transcriptionFacade.updateTranscript(transcript);
  }
}
