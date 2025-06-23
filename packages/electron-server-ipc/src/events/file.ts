import { DeleteFilesResponse, FileMetadata, UploadFileParams } from '../types/file';

export interface FileDispatchEvents {
  deleteFiles: (paths: string[]) => DeleteFilesResponse;
  getStaticFilePath: (id: string) => string;
  createFile: (param: UploadFileParams) => { metadata: FileMetadata; success: boolean };
}
