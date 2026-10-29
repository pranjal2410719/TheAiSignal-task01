export type Modality = "Text" | "Image" | "Audio" | "Video" | "PDF";

export interface ModelRecord {
  id: string;
  name: string;
  lab: string;
  description: string;
  contextWindow: number;
  maxOutput: number;
  inputModalities: Modality[];
  outputModalities: Modality[];
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  intelligenceScore: number;
  codingScore: number;
  agenticScore: number;
  providers: string[];
  releaseDate: string;
  weights: "Open" | "Closed";
  isSampleData: true;
  playgroundModelId?: string;
  isPlaygroundRunnable?: boolean;
}
