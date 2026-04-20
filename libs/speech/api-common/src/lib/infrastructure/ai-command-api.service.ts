import { Injectable, Provider } from '@angular/core';
import {
  AI_COMMAND_GATEWAY,
  AiCommandGateway,
  AiCommandRequest,
  AiCommandResponse,
} from '@jarvis/speech-domain';

const AI_WEBHOOK_URL: string | null = null;

@Injectable({ providedIn: 'root' })
export class AiCommandApiService implements AiCommandGateway {
  async sendCommand(request: AiCommandRequest): Promise<AiCommandResponse> {
    if (!AI_WEBHOOK_URL) {
      throw new Error('AI webhook is not configured.');
    }

    const response = await fetch(AI_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`AI webhook failed with status ${response.status}.`);
    }

    return (await response.json()) as AiCommandResponse;
  }
}

export function provideAiCommandApi(): Provider {
  return {
    provide: AI_COMMAND_GATEWAY,
    useExisting: AiCommandApiService,
  };
}
