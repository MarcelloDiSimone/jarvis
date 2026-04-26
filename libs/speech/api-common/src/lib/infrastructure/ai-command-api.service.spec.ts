import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import {
  AiCommandApiService,
  provideAiCommandApi,
} from './ai-command-api.service';

describe('AiCommandApiService', () => {
  let service: AiCommandApiService;
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    TestBed.configureTestingModule({
      providers: [
        ...provideAiCommandApi({
          webhookUrl: 'http://localhost:5678/webhook/command',
        }),
      ],
    });
    service = TestBed.inject(AiCommandApiService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the assistant message from output text content', async () => {
    fetchMock.mockResolvedValue(
      createAiWebhookResponse('Hi! I would be happy to check.'),
    );

    await expect(
      service.sendCommand({ message: 'What is the weather?' }),
    ).resolves.toEqual({
      message: 'Hi! I would be happy to check.',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5678/webhook/command',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'What is the weather?' }),
      },
    );
  });

  it('rejects responses without output text', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ output: [] })));

    await expect(
      service.sendCommand({ message: 'Turn on lights' }),
    ).rejects.toThrow('AI webhook response is missing output text.');
  });
});

function createAiWebhookResponse(text: string): Response {
  return new Response(
    JSON.stringify({
      output: [
        {
          id: 'msg_0fe32d4cf5a69cbd0069ee85b6fad4819988679affc9badecc',
          type: 'message',
          status: 'completed',
          content: [
            {
              type: 'output_text',
              annotations: [],
              logprobs: [],
              text,
            },
          ],
          role: 'assistant',
        },
      ],
    }),
  );
}
