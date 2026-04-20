import { TestBed } from '@angular/core/testing';
import { SpeechSynthesisService } from './speech-synthesis.service';

describe('SpeechSynthesisService', () => {
  it('creates', () => {
    TestBed.configureTestingModule({});

    const service = TestBed.inject(SpeechSynthesisService);

    expect(service).toBeTruthy();
  });
});
