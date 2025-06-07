export interface ImageGenerationTopic {
  id: string;
  title?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationAsset {
  /**
   * api provider 家的 cdn url，一般很快就会失效
   */
  originalUrl?: string;
  /**
   * 存到自己 oss 的 url
   */
  url?: string;
  /**
   * 缩略图，图片那就是尺寸裁剪过的，视频那就是封面的缩略图
   */
  thumbnailUrl?: string;
  /**
   * 图片/视频的宽度
   */
  width?: number;
  /**
   * 图片/视频的高度
   */
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
