import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { SpeechSynthesisService } from './speech-synthesis.service';

describe('SpeechSynthesisService', () => {
  const originalSpeechSynthesis = window.speechSynthesis;
  let service: SpeechSynthesisService;
  let getVoices: ReturnType<typeof vi.fn<() => SpeechSynthesisVoice[]>>;
  let speak: ReturnType<typeof vi.fn<(utterance: SpeechSynthesisUtterance) => void>>;

  class MockSpeechSynthesisUtterance {
    onend: ((event: SpeechSynthesisEvent) => void) | null = null;
    onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
    onstart: ((event: SpeechSynthesisEvent) => void) | null = null;
    pitch = 1;
    rate = 1;
    voice: SpeechSynthesisVoice | null = null;

    constructor(readonly text: string) {}
  }

  beforeEach(() => {
    const voices = [
      createVoice('Shelley Premium', 'en-US'),
      createVoice('Zarvox', 'en-US'),
    ];

    getVoices = vi.fn(() => voices);
    speak = vi.fn((utterance) => {
      utterance.onstart?.({} as SpeechSynthesisEvent);
      utterance.onend?.({} as SpeechSynthesisEvent);
    });

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        addEventListener: vi.fn(),
        cancel: vi.fn(),
        getVoices,
        pending: false,
        removeEventListener: vi.fn(),
        speak,
        speaking: false,
      },
    });
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);

    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeechSynthesisService);
  });

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: originalSpeechSynthesis,
    });
    vi.unstubAllGlobals();
  });

  it('creates', () => {
    expect(service).toBeTruthy();
  });

  it('reuses the selected voice across speak calls', async () => {
    await firstValueFrom(service.speak('First response.'));
    await firstValueFrom(service.speak('Second response.'));

    expect(getVoices).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledTimes(2);
    expect(speak.mock.calls[0]?.[0].voice?.name).toBe('Zarvox');
    expect(speak.mock.calls[1]?.[0].voice?.name).toBe('Zarvox');
  });

  it('reloads the voice after changing the preference', async () => {
    await firstValueFrom(service.speak('First response.'));

    service.setVoicePreference({ name: 'Zarvox' });
    await firstValueFrom(service.speak('Second response.'));

    expect(getVoices).toHaveBeenCalledTimes(2);
    expect(speak.mock.calls[1]?.[0].voice?.name).toBe('Zarvox');
  });

  it('starts speech only when subscribed', async () => {
    const speech$ = service.speak('Deferred response.');

    expect(speak).not.toHaveBeenCalled();

    await firstValueFrom(speech$);

    expect(speak).toHaveBeenCalledOnce();
  });
});

function createVoice(name: string, lang: string): SpeechSynthesisVoice {
  return {
    default: false,
    lang,
    localService: true,
    name,
    voiceURI: name,
  };
}
