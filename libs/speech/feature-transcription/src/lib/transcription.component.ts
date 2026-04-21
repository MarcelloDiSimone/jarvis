import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  type OnDestroy,
} from '@angular/core';
import { TranscriptionFacade, type VoiceState } from '@jarvis/speech-domain';
import { UiJarvisInterfaceComponent } from '@jarvis/speech-ui-common';

@Component({
  standalone: true,
  imports: [UiJarvisInterfaceComponent],
  selector: 'speech-feature-transcription-shell',
  templateUrl: './transcription.component.html',
  styleUrls: ['./transcription.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureTranscriptionComponent implements OnDestroy {
  private readonly transcriptionFacade = inject(TranscriptionFacade);
  protected readonly transcript = this.transcriptionFacade.activeTranscript;
  protected readonly isRecording = this.transcriptionFacade.isRecording;
  protected readonly microphoneLoudnessLevel =
    this.transcriptionFacade.microphoneLoudnessLevel;
  protected readonly statusMessage = this.transcriptionFacade.statusMessage;
  protected readonly voiceState = this.transcriptionFacade.voiceState;
  protected readonly isSupported = this.transcriptionFacade.isSupported();

  protected readonly voiceStateLabel = computed(() => {
    return this.voiceStateLabels[this.voiceState()];
  });

  protected readonly showReactivate = computed(() => {
    return this.voiceState() === 'inactive' && this.isSupported;
  });

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
