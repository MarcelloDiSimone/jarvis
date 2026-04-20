import { InjectionToken } from '@angular/core';

export type AiCommandRequest = {
  message: string;
};

export type AiCommandResponse = {
  message: string;
};

export interface AiCommandGateway {
  sendCommand(request: AiCommandRequest): Promise<AiCommandResponse>;
}

export const AI_COMMAND_GATEWAY = new InjectionToken<AiCommandGateway>(
  'AI_COMMAND_GATEWAY',
);
