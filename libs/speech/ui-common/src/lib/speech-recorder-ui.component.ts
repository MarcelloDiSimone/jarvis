import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'speech-ui-recorder',
  standalone: true,
  templateUrl: './speech-recorder-ui.component.html',
  styleUrl: './speech-recorder-ui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeechRecorderUiComponent {
  readonly text = input('');
  readonly isRecording = input(false);

  readonly textChanged = output<string>();
  readonly recordToggled = output<void>();
}
