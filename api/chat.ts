/**
 * Chat API Handler for Valuation Academy AI Tutor
 *
 * 이 파일은 서버리스 함수 또는 Express 백엔드에서 사용할 수 있습니다.
 * Vercel, Netlify Functions, AWS Lambda 등과 호환됩니다.
 *
 * 환경 변수 필요:
 * - CLAUDE_API_KEY: Anthropic Claude API 키
 * - ALLOWED_ORIGIN: 허용할 CORS 오리진 (선택, 미설정 시 와일드카드)
 */

import Anthropic from '@anthropic-ai/sdk';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt?: string;
}

interface ChatResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES_COUNT = 50;
const MAX_CONTEXT_LENGTH = 2000;

const defaultSystemPrompt = `당신은 밸류에이션 전문 AI 튜터입니다.

## 전문 분야
- DCF (현금흐름할인법): FCFF, FCFE, WACC, 터미널 가치
- 상대가치평가: PER, PBR, EV/EBITDA, PSR
- 기술적 분석: 캔들차트, 이동평균, RSI, MACD
- 투자 대가들의 철학: 그레이엄, 버핏, 린치, 피셔 등
- 한국 금융 자격증: 투자자산운용사, 금융투자분석사, CFA

## 응답 원칙
1. 한국어로 친절하고 상세하게 답변
2. 복잡한 개념은 예시와 함께 설명
3. 필요시 공식을 수학적으로 표현
4. 실제 투자에 적용할 수 있는 실용적 조언 제공
5. 불확실한 내용은 명확히 한계를 밝힘

## 주의사항
- 특정 종목 매수/매도 추천은 하지 않음
- 투자 결정은 본인 책임임을 안내
- 최신 시장 데이터는 실시간 제공 불가`;

function validateRequest(request: ChatRequest): void {
  if (!request.messages || !Array.isArray(request.messages) || request.messages.length === 0) {
    throw new Error('유효하지 않은 요청입니다.');
  }

  if (request.messages.length > MAX_MESSAGES_COUNT) {
    throw new Error('메시지 수가 제한을 초과했습니다.');
  }

  for (const msg of request.messages) {
    if (!msg.role || !msg.content || typeof msg.content !== 'string') {
      throw new Error('유효하지 않은 메시지 형식입니다.');
    }
    if (msg.role !== 'user' && msg.role !== 'assistant') {
      throw new Error('유효하지 않은 메시지 역할입니다.');
    }
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      throw new Error('메시지가 너무 깁니다.');
    }
  }
}

function buildSystemPrompt(clientContext?: string): string {
  if (!clientContext) return defaultSystemPrompt;

  // 클라이언트 컨텍스트는 보충 정보로만 추가 (기본 프롬프트는 항상 유지)
  const truncatedContext = clientContext.slice(0, MAX_CONTEXT_LENGTH);
  return `${defaultSystemPrompt}\n\n---\n추가 컨텍스트:\n${truncatedContext}`;
}

export async function handleChatRequest(request: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey || apiKey === 'sk-ant-api03-xxxxx') {
    throw new Error('API 설정 오류');
  }

  validateRequest(request);

  const client = new Anthropic({
    apiKey,
  });

  const systemPrompt = buildSystemPrompt(request.systemPrompt);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: request.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  const textContent = response.content.find((block) => block.type === 'text');
  const content = textContent?.type === 'text' ? textContent.text : '응답을 생성할 수 없습니다.';

  return {
    content,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    },
  };
}

// Express.js 핸들러
export function createExpressHandler() {
  return async (req: any, res: any) => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const result = await handleChatRequest(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('Chat API Error:', error);
      // 클라이언트에는 안전한 에러 메시지만 전달
      const safeMessages = [
        'API 설정 오류',
        '유효하지 않은 요청입니다.',
        '메시지 수가 제한을 초과했습니다.',
        '유효하지 않은 메시지 형식입니다.',
        '유효하지 않은 메시지 역할입니다.',
        '메시지가 너무 깁니다.',
      ];
      const message = safeMessages.includes(error.message)
        ? error.message
        : '서버 오류가 발생했습니다.';
      res.status(500).json({ error: message });
    }
  };
}

// Vercel/Netlify Serverless 핸들러
export default async function handler(req: any, res: any) {
  // CORS 헤더 - 환경 변수로 오리진 제한 가능
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return createExpressHandler()(req, res);
}
