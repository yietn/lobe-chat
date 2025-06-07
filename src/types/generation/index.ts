export interface ImageGenerationTopic {
  id: string;
  title?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationAsset {
  imageUrl?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export interface GenerationConfig {
  size: string;
  steps: number;
  cfg: number;
}

export interface Generation {
  id: string;
  /**
   * The asset associated with the generation, containing image URLs and dimensions.
   */
  asset?: GenerationAsset | null;
  seed?: string | null;
  createdAt: Date;
}

export interface GenerationBatch {
  id: string;
  provider: string;
  model: string;
  prompt: string;
  width?: number | null;
  height?: number | null;
  config?: GenerationConfig;
  createdAt: Date;
  generations: Generation[];
}
