import { parentPort, workerData } from 'worker_threads';
import { WorkerData } from '../types';

function sumArray(workerData: WorkerData): bigint {
  let result: bigint = 0n;
  const chunkStart = workerData.chunk.start;
  const chunkEnd = workerData.chunk.end;
  const buffer = workerData.buffer;
  let data: BigInt64Array | bigint[] = [];
  if (buffer instanceof SharedArrayBuffer) {
    data = new BigInt64Array(buffer);
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
