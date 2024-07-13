import { parentPort, workerData } from 'worker_threads';
import { WorkerData } from '../types';

function sumArray(workerData: WorkerData): number {
  let result: number = 0;
  const chunkStart = workerData.chunk.start;
  const chunkEnd = workerData.chunk.end;
  const buffer = workerData.buffer;
  let data: Int32Array | number[] = [];
  if (buffer instanceof SharedArrayBuffer) {
    data = new Int32Array(buffer);
  } else {
    data = buffer;
  }
  for (let i = chunkStart; i < chunkEnd; i++) {
    result += data[i];
  }
  return result;
}

if (parentPort) {
  const sum = sumArray(workerData);
  parentPort.postMessage(sum);
}
