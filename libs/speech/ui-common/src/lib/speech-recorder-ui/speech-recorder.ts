import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'ui-speech-recorder',
  standalone: true,
  templateUrl: './speech-recorder.html',
  styleUrl: './speech-recorder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSpeechRecorderComponent {
  readonly text = input('');
  readonly isRecording = input(false);

  readonly textChanged = output<string>();
  readonly recordToggled = output<void>();
}
