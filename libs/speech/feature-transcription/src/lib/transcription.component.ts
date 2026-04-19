import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'speech-feature-transcription-shell',
  templateUrl: './transcription.component.html',
  styleUrls: ['./transcription.component.scss'],
})
export class TranscriptionComponent {}
