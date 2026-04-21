# Jarvis

Jarvis is an Angular frontend for a speech-controlled API webhook. It listens for a wake word, captures a spoken command, and sends that command to a configurable AI/API endpoint.

Live demo:

https://marcellodisimone.github.io/jarvis/

## How It Works

1. Open the app in a browser that supports the Web Speech API.
2. Start voice control.
3. Say the wake word:

   ```text
   Jarvis
   ```

4. Wait for the spoken acknowledgement:

   ```text
   Yes, my master
   ```

5. Speak your command.
6. Jarvis captures the command and sends it to the configured API webhook.

To stop listening, say:

```text
go to sleep
```

If command handling fails, Jarvis falls back with:

```text
Sorry Dave, I can't do this.
```

## Current Deployment Shape

The GitHub Pages deployment hosts the static Angular frontend only. Browser speech recognition and microphone access can work there because GitHub Pages is served over HTTPS.

The API webhook is separate from GitHub Pages. GitHub Pages cannot run the Node API or any server-side webhook logic. To execute commands end to end, configure the frontend to call a hosted API/webhook endpoint.

## Projects

- `jarvis-client` - Angular speech UI frontend.
- `speech-domain` - Speech domain logic, voice state, recognition, synthesis, loudness, and command gateway contracts.
- `speech-feature-transcription` - Speech transcription feature shell.
- `speech-ui-common` - Reusable speech UI components.
- `speech-api-common` - API/webhook adapter for speech commands.
- `api` - Minimal Express API app for local/backend experiments.
- `jarvis-client-e2e` - Playwright smoke tests for the client.

## Local Development

Install dependencies:

```bash
npm ci
```

Run the client:

```bash
npm exec nx serve jarvis-client
```

Run the API:

```bash
npm exec nx serve api
```

Build the static client:

```bash
npm exec nx run jarvis-client:build
```

Build for GitHub Pages:

```bash
npm exec nx run jarvis-client:build:github-pages
```

The deployable output is:

```text
dist/apps/jarvis-client/browser
```

## Useful Nx Commands

List projects:

```bash
npm exec nx show projects
```

Run focused checks:

```bash
npm exec nx run jarvis-client:typecheck
npm exec nx run jarvis-client:lint
npm exec nx run jarvis-client:test
```

Run affected tasks:

```bash
npm exec nx affected -t typecheck lint test
```
