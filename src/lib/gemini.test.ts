import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

// Define mock text containing all keywords to satisfy all tests
const mockResultText = '# Personalized Preparedness Plan | ## Travel Advisory | Stay indoors away from metallic structures during lightning.';

vi.mock('@google/generative-ai', () => {
  class MockGoogleGenerativeAI {
    constructor(apiKey: string) {}
    getGenerativeModel(config: { model: string }) {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => mockResultText
          }
        }),
        startChat: vi.fn().mockReturnValue({
          sendMessage: vi.fn().mockResolvedValue({
            response: {
              text: () => mockResultText
            }
          })
        })
      };
    }
  }

  return {
    GoogleGenerativeAI: MockGoogleGenerativeAI
  };
});

describe('Gemini Integration Services', () => {
  let generatePreparednessPlan: any;
  let askSafetyAssistant: any;
  let getTravelAdvisory: any;

  beforeAll(async () => {
    process.env.GEMINI_API_KEY = 'mock_gemini_key';
    const mod = await import('./gemini');
    generatePreparednessPlan = mod.generatePreparednessPlan;
    askSafetyAssistant = mod.askSafetyAssistant;
    getTravelAdvisory = mod.getTravelAdvisory;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePreparednessPlan', () => {
    it('successfully calls Gemini and returns the generated plan markdown', async () => {
      const plan = await generatePreparednessPlan(4, 'Mumbai', 'Apartment', 'Rainy');
      expect(plan).toContain('# Personalized Preparedness Plan');
    });
  });

  describe('askSafetyAssistant', () => {
    it('initiates chat conversation and returns safety instructions', async () => {
      const reply = await askSafetyAssistant('Lightning safety', []);
      expect(reply).toContain('Stay indoors away from metallic structures during lightning.');
    });
  });

  describe('getTravelAdvisory', () => {
    it('generates route safety analysis and details risks', async () => {
      const advisory = await getTravelAdvisory('Mumbai', 'Pune', 'Heavy Rain', 'Light Rain');
      expect(advisory).toContain('## Travel Advisory');
    });
  });
});
