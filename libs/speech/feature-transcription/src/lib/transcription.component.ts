import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranscriptionFacade, type VoiceState } from '@jarvis/speech-domain';
import { SpeechTranscriptFormComponent } from '@jarvis/speech-ui-common';

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
  protected readonly voiceState$ = this.transcriptionFacade.voiceState$;
  protected readonly isSupported = this.transcriptionFacade.isSupported();

  constructor() {
    this.transcriptionFacade.start();
  }

  protected updateTranscript(transcript: string): void {
    this.transcriptionFacade.updateTranscript(transcript);
  }

  protected reactivate(): void {
    this.transcriptionFacade.reactivate();
  }

  protected readonly voiceStateLabels: Record<VoiceState, string> = {
    inactive: 'Inactive',
    waiting: 'Waiting',
    recording: 'Recording',
  };

  ngOnDestroy(): void {
    this.transcriptionFacade.stop();
  }
}
