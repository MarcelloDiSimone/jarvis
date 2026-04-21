import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-jarvis-interface',
  templateUrl: './jarvis-interface.html',
  styleUrl: './jarvis-interface.scss',
  host: {
    '[class.recording]': 'isRecording()',
    '[style.--loudness]': '1',
  },
})
export class UiJarvisInterfaceComponent {
  readonly loudness = input(0);
  readonly voiceState = input('inactive');

  readonly isRecording = computed(() => this.voiceState() === 'recording');

  protected readonly normalizedLoudness = computed(() => {
    const loudness = this.loudness();

    if (!Number.isFinite(loudness)) {
      return 0;
    }

    return Math.min(1, Math.max(0, loudness));
  });
}
