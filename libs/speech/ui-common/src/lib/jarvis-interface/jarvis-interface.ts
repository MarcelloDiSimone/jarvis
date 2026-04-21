import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'ui-jarvis-interface',
  templateUrl: './jarvis-interface.html',
  styleUrl: './jarvis-interface.scss',
  host: {
    '[class.recording]': 'isRecording()',
    '[style.--loudness]': 'renderedLoudness()',
  },
})
export class UiJarvisInterfaceComponent {
  private readonly destroyRef = inject(DestroyRef);
  private loudnessThrottleTimeout: ReturnType<typeof setTimeout> | undefined;
  private lastRenderedLoudness = 0;
  private pendingLoudness: number | undefined;

  readonly loudness = input(0);
  readonly voiceState = input('inactive');

  readonly isRecording = computed(() => this.voiceState() === 'recording');

  protected readonly renderedLoudness = signal(0);

  protected readonly normalizedLoudness = computed(() => {
    const loudness = this.loudness();

    if (!Number.isFinite(loudness)) {
      return 0;
    }

    const clampedLoudness = Math.min(1, Math.max(0, loudness));

    return Math.round(clampedLoudness * 100) / 100;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.loudnessThrottleTimeout === undefined) {
        return;
      }

      clearTimeout(this.loudnessThrottleTimeout);
    });
  }

  private readonly updateRenderedLoudness = effect(() => {
    const loudness = this.normalizedLoudness();

    if (this.lastRenderedLoudness === loudness) {
      return;
    }

    if (this.loudnessThrottleTimeout === undefined) {
      this.setRenderedLoudness(loudness);
      this.loudnessThrottleTimeout = setTimeout(() => {
        this.loudnessThrottleTimeout = undefined;

        if (
          this.pendingLoudness === undefined ||
          this.pendingLoudness === this.lastRenderedLoudness
        ) {
          this.pendingLoudness = undefined;
          return;
        }

        this.setRenderedLoudness(this.pendingLoudness);
        this.pendingLoudness = undefined;
      }, 40);
      return;
    }

    this.pendingLoudness = loudness;
  });

  private setRenderedLoudness(loudness: number): void {
    this.lastRenderedLoudness = loudness;
    this.renderedLoudness.set(loudness);
  }
}
