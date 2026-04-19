import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranscriptionFacade {
  private readonly activeTranscriptSubject = new BehaviorSubject<string>('');
  readonly activeTranscript$ = this.activeTranscriptSubject.asObservable();
}
