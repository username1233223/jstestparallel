export interface ChunkIndex {
  start: number;
  end: number;
}
export interface WorkerData {
  buffer: SharedArrayBuffer | number[];
  chunk: ChunkIndex;
  path: string;
}
