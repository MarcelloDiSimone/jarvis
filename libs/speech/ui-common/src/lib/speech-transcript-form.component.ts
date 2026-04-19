import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'speech-ui-common-transcript-form',
  templateUrl: './speech-transcript-form.component.html',
  styleUrl: './speech-transcript-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeechTranscriptFormComponent {
  readonly transcript = input('');
  readonly isRecording = input(false);
  readonly isSupported = input(true);
  readonly statusMessage = input('');

  readonly recordClicked = output<void>();
  readonly transcriptChange = output<string>();

  onTranscriptInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.transcriptChange.emit(target.value);
  }

  onRecordClick(): void {
    this.recordClicked.emit();
  }
}
