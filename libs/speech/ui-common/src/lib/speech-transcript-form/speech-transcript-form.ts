import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { VoiceState } from '@jarvis/speech-domain';

@Component({
  selector: 'ui-speech-transcript-form',
  standalone: true,
  templateUrl: './speech-transcript-form.html',
  styleUrl: './speech-transcript-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSpeechTranscriptFormComponent {
  readonly transcript = input('');
  readonly isRecording = input(false);
  readonly isSupported = input(true);
  readonly statusMessage = input('');
  readonly voiceState = input<VoiceState>('inactive');
  readonly voiceStateLabel = input('Inactive');
  readonly showReactivate = input(false);

  readonly transcriptChange = output<string>();
  readonly reactivateClicked = output<void>();

  onTranscriptInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.transcriptChange.emit(target.value);
  }

  onReactivateClick(): void {
    this.reactivateClicked.emit();
  }
}
