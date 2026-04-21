import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'speech',
  },
  {
    path: 'speech',
    loadComponent: () =>
      import('@jarvis/speech-feature-transcription').then(
        (module) => module.FeatureTranscriptionComponent,
      ),
  },
];
