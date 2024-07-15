export interface ChunkIndex {
  start: number;
  end: number;
}
export interface WorkerData {
  buffer: SharedArrayBuffer | bigint[];
  chunk: ChunkIndex;
  path: string;
}
