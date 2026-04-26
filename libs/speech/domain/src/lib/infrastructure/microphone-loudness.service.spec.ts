import { TestBed } from '@angular/core/testing';
import {
  calculateLoudness,
  MICROPHONE_LOUDNESS_CONSTRAINTS,
  MicrophoneLoudnessService,
} from './microphone-loudness.service';

describe('MicrophoneLoudnessService', () => {
  it('creates', () => {
    TestBed.configureTestingModule({});

    const service = TestBed.inject(MicrophoneLoudnessService);

    expect(service).toBeTruthy();
  });

  it('requests raw microphone audio without browser voice processing', () => {
    expect(MICROPHONE_LOUDNESS_CONSTRAINTS).toEqual({
      audio: {
        autoGainControl: false,
        echoCancellation: false,
        noiseSuppression: false,
      },
    });
  });
});

describe('calculateLoudness', () => {
  it('returns 0 for silence', () => {
    expect(calculateLoudness(new Uint8Array([128, 128, 128, 128]))).toBe(0);
  });

  it('returns normalized loudness for waveform samples', () => {
    const loudness = calculateLoudness(new Uint8Array([128, 192, 128, 64]));

    expect(loudness).toBeCloseTo(1, 5);
  });

  it('expands subtle waveform changes without changing the maximum', () => {
    const loudness = calculateLoudness(new Uint8Array([128, 132, 128, 124]));

    expect(loudness).toBeGreaterThan(0.25);
    expect(loudness).toBeLessThan(0.27);
  });
});
