import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranscriptionFacade } from '@jarvis/speech-domain';
import { vi } from 'vitest';
import { FeatureTranscriptionComponent } from './transcription.component';

describe('FeatureTranscriptionComponent', () => {
  let fixture: ComponentFixture<FeatureTranscriptionComponent>;
  let transcriptionFacade: {
    activeTranscript: ReturnType<typeof signal<string>>;
    isRecording: ReturnType<typeof signal<boolean>>;
    microphoneLoudnessLevel: ReturnType<typeof signal<number>>;
    statusMessage: ReturnType<typeof signal<string>>;
    voiceState: ReturnType<typeof signal<'inactive' | 'waiting' | 'recording' | 'reading'>>;
    isSupported: ReturnType<typeof vi.fn<() => boolean>>;
    reactivate: ReturnType<typeof vi.fn<() => void>>;
    start: ReturnType<typeof vi.fn<() => void>>;
    stop: ReturnType<typeof vi.fn<() => void>>;
    updateTranscript: ReturnType<typeof vi.fn<(transcript: string) => void>>;
  };

  beforeEach(async () => {
    transcriptionFacade = {
      activeTranscript: signal(''),
      isRecording: signal(false),
      microphoneLoudnessLevel: signal(0),
      statusMessage: signal('Waiting for "Jarvis"...'),
      voiceState: signal('inactive'),
      isSupported: vi.fn(() => true),
      reactivate: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      updateTranscript: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FeatureTranscriptionComponent],
      providers: [
        {
          provide: TranscriptionFacade,
          useValue: transcriptionFacade,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureTranscriptionComponent);
    fixture.detectChanges();
  });

  it('starts voice control when created', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(transcriptionFacade.start).toHaveBeenCalledOnce();
  });

  it('passes reading state to the Jarvis interface', () => {
    transcriptionFacade.voiceState.set('reading');
    fixture.detectChanges();

    const jarvisInterface = fixture.nativeElement.querySelector(
      'ui-jarvis-interface',
    );

    expect(jarvisInterface?.classList.contains('reading')).toBe(true);
  });
});
