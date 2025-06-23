export interface DeleteFilesResponse {
  errors?: { message: string; path: string }[];
  success: boolean;
}

export interface UploadFileParams {
  content: ArrayBuffer;
  filename: string;
  hash: string;
  path: string;
  type: string;
}

export interface FileMetadata {
  date: string;
  dirname: string;
  filename: string;
  path: string;
}
