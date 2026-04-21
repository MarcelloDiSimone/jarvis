import { TestBed } from '@angular/core/testing';
import {
  calculateLoudness,
  MicrophoneLoudnessService,
} from './microphone-loudness.service';

describe('MicrophoneLoudnessService', () => {
  it('creates', () => {
    TestBed.configureTestingModule({});

    const service = TestBed.inject(MicrophoneLoudnessService);

    expect(service).toBeTruthy();
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
});
