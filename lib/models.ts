import type { ModelRecord } from "@/lib/types";

// Prices, scores, dates, and providers below are assessment demo data, not a live catalog.
export const models: ModelRecord[] = [
  { id: "openai/gpt-6.1-terra", name: "GPT-6.1 Terra", lab: "OpenAI", description: "Illustrative entry for fast visual reasoning.", contextWindow: 1050000, maxOutput: 128000, inputModalities: ["Text", "Image", "PDF"], outputModalities: ["Text"], inputPricePerMillion: 1, outputPricePerMillion: 5, intelligenceScore: 48.1, codingScore: 52.4, agenticScore: 45, providers: ["Azure", "Together", "OpenRouter"], releaseDate: "Oct 26, 2026", weights: "Closed", isSampleData: true },
  { id: "deepseek/deepseek-v4.1-flash-uncensored", name: "DeepSeek V4.1 Flash", lab: "DeepSeek", description: "Illustrative entry for throughput and code tasks.", contextWindow: 1000000, maxOutput: 131000, inputModalities: ["Text", "Image"], outputModalities: ["Text"], inputPricePerMillion: 0.33, outputPricePerMillion: 1.32, intelligenceScore: 46.2, codingScore: 54.1, agenticScore: 43.8, providers: ["DeepInfra", "Fireworks", "Groq", "Together"], releaseDate: "Oct 23, 2026", weights: "Open", isSampleData: true },
  { id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet", lab: "Anthropic", description: "Illustrative historical model entry.", contextWindow: 200000, maxOutput: 8192, inputModalities: ["Text", "Image"], outputModalities: ["Text"], inputPricePerMillion: 3, outputPricePerMillion: 15, intelligenceScore: 51.2, codingScore: 58.7, agenticScore: 49.3, providers: ["AWS Bedrock", "GCP Vertex", "OpenRouter"], releaseDate: "Jun 20, 2024", weights: "Closed", isSampleData: true },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", lab: "Google", description: "Illustrative multimodal model entry.", contextWindow: 1000000, maxOutput: 65536, inputModalities: ["Text", "Image", "Audio", "Video"], outputModalities: ["Text"], inputPricePerMillion: 0.3, outputPricePerMillion: 2.5, intelligenceScore: 44.8, codingScore: 48.2, agenticScore: 42.1, providers: ["Google AI Studio", "GCP Vertex", "OpenRouter"], releaseDate: "May 20, 2025", weights: "Closed", isSampleData: true },
];

export const DEFAULT_MODEL_IDS = [models[0].id, models[1].id];
export const MAX_SELECTED_MODELS = 4;
export const MIN_SELECTED_MODELS = 2;
