import { inject, Injectable, InjectionToken, Provider } from '@angular/core';
import {
  AI_COMMAND_GATEWAY,
  AiCommandGateway,
  AiCommandRequest,
  AiCommandResponse,
} from '@jarvis/speech-domain';

export type AiCommandApiConfig = {
  webhookUrl: string;
};

const AI_COMMAND_API_CONFIG = new InjectionToken<AiCommandApiConfig>(
  'AI_COMMAND_API_CONFIG',
);

type AiWebhookOutputContent = {
  type: 'output_text';
  annotations: unknown[];
  logprobs: unknown[];
  text: string;
};

type AiWebhookOutput = {
  id: string;
  type: 'message';
  status: 'completed';
  content: AiWebhookOutputContent[];
  role: 'assistant';
};

type AiWebhookResponse = {
  output: AiWebhookOutput[];
};

@Injectable({ providedIn: 'root' })
export class AiCommandApiService implements AiCommandGateway {
  private readonly config = inject(AI_COMMAND_API_CONFIG);

  async sendCommand(request: AiCommandRequest): Promise<AiCommandResponse> {
    const webhookUrl = this.config.webhookUrl.trim();

    if (!webhookUrl) {
      throw new Error('AI webhook is not configured.');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`AI webhook failed with status ${response.status}.`);
    }

    return {
      message: extractAiCommandMessage(await response.json()),
    };
  }
}

export function provideAiCommandApi(config: AiCommandApiConfig): Provider[] {
  return [
    {
      provide: AI_COMMAND_API_CONFIG,
      useValue: config,
    },
    {
      provide: AI_COMMAND_GATEWAY,
      useExisting: AiCommandApiService,
    },
  ];
}

function extractAiCommandMessage(payload: unknown): string {
  if (!isAiWebhookResponse(payload)) {
    throw new Error('AI webhook response is missing output.');
  }

  const outputText = payload.output
    .flatMap((output) => output.content)
    .find((content) => content.type === 'output_text');

  if (!outputText) {
    throw new Error('AI webhook response is missing output text.');
  }

  return outputText.text;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAiWebhookResponse(value: unknown): value is AiWebhookResponse {
  return (
    isRecord(value) &&
    Array.isArray(value['output']) &&
    value['output'].every(isAiWebhookOutput)
  );
}

function isAiWebhookOutput(value: unknown): value is AiWebhookOutput {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    value['type'] === 'message' &&
    value['status'] === 'completed' &&
    value['role'] === 'assistant' &&
    Array.isArray(value['content']) &&
    value['content'].every(isAiWebhookOutputContent)
  );
}

function isAiWebhookOutputContent(
  value: unknown,
): value is AiWebhookOutputContent {
  return (
    isRecord(value) &&
    value['type'] === 'output_text' &&
    Array.isArray(value['annotations']) &&
    Array.isArray(value['logprobs']) &&
    typeof value['text'] === 'string'
  );
}
