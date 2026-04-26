import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { vi } from 'vitest';
import { UiJarvisInterfaceComponent } from './jarvis-interface';

describe('UiJarvisInterfaceComponent', () => {
  let component: UiJarvisInterfaceComponent;
  let fixture: ComponentFixture<UiJarvisInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiJarvisInterfaceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiJarvisInterfaceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets a reading host class for response playback', () => {
    fixture.componentRef.setInput('voiceState', 'reading');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('reading')).toBe(true);
    expect(fixture.nativeElement.classList.contains('recording')).toBe(false);
  });

  it('throttles rounded normalized loudness updates on the host style', () => {
    vi.useFakeTimers();

    try {
      fixture.detectChanges();

      expect(fixture.nativeElement.style.getPropertyValue('--loudness')).toBe(
        '0',
      );

      fixture.componentRef.setInput('loudness', 0.424);
      fixture.detectChanges();

      expect(fixture.nativeElement.style.getPropertyValue('--loudness')).toBe(
        '0.42',
      );

      fixture.componentRef.setInput('loudness', 0.876);
      fixture.detectChanges();

      expect(fixture.nativeElement.style.getPropertyValue('--loudness')).toBe(
        '0.42',
      );

      vi.advanceTimersByTime(40);
      fixture.detectChanges();

      expect(fixture.nativeElement.style.getPropertyValue('--loudness')).toBe(
        '0.88',
      );

      fixture.componentRef.setInput('loudness', 2);
      fixture.detectChanges();
      vi.advanceTimersByTime(40);
      fixture.detectChanges();

      expect(fixture.nativeElement.style.getPropertyValue('--loudness')).toBe(
        '1',
      );

      fixture.componentRef.setInput('loudness', -1);
      fixture.detectChanges();
      vi.advanceTimersByTime(40);
      fixture.detectChanges();

      expect(fixture.nativeElement.style.getPropertyValue('--loudness')).toBe(
        '0',
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
