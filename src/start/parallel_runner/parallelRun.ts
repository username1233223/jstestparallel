import { Worker } from 'worker_threads';
import * as path from 'path';
import { ChunkIndex } from '../types';

const WORKER_DIR_PATH = '../worker_sum';
export const MAX_WORKERS = 5;
export const MAX_SIZE = 1000000;

export function generateRandomSharedArray(size: number): BigInt64Array {
  const sharedArrayBuffer = new SharedArrayBuffer(size * 8);
  const result = new BigInt64Array(sharedArrayBuffer);
  for (let i = 0; i < size; i++) {
    result[i] = BigInt(Math.floor(Math.random() * 100 - 49.5));
  }
  return result;
}
export function makeSharedArray(data: number[]): BigInt64Array {
  const size = data.length;
  const sharedArrayBuffer = new SharedArrayBuffer(size * 8);
  const result = new BigInt64Array(sharedArrayBuffer);
  for (let i = 0; i < size; i++) {
    result[i] = BigInt(data[i]);
  }
  return result;
}
export function generateFilledSharedArray(size: number, value: number): BigInt64Array {
  const sharedArrayBuffer = new SharedArrayBuffer(size * 8);
  const result = new BigInt64Array(sharedArrayBuffer);
  for (let i = 0; i < size; i++) {
    result[i] = BigInt(value);
  }
  return result;
}
function getChunkIndices(length: number, parts: number): ChunkIndex[] {
  if (length <= parts) {
    return [{ start: 0, end: length }];
  }
  const result: ChunkIndex[] = [];
  const chunkSize = Math.ceil(length / parts);

  let start = 0;
  let end = 0;
  for (let i = 0; i < parts; i++) {
    start = i * chunkSize;
    end = Math.min((i + 1) * chunkSize, length);
    if (start <= end) {
      result.push({ start, end });
    }
  }
  return result;
}

function createWorker(
  data: BigInt64Array | bigint[],
  chunk: ChunkIndex,
  workerScript: string
): Promise<bigint> {
  return new Promise((resolve, reject) => {
    let buffer: ArrayBufferLike | bigint[] = [];
    if (data instanceof BigInt64Array) {
      buffer = data.buffer;
    } else {
      buffer = data;
    }
    const worker = new Worker(path.join(__dirname, `${WORKER_DIR_PATH}/${workerScript}.js`), {
      workerData: {
        buffer: buffer,
        chunk: chunk,
        path: `${WORKER_DIR_PATH}/${workerScript}.ts`,
      },
    });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

export async function parallelRun(
  data: BigInt64Array,
  numWorkers: number,
  workerScript: string
): Promise<bigint> {
  if (numWorkers < 1) {
    throw new Error('At least 1 worker expected');
  }
  if (numWorkers > MAX_WORKERS) {
    throw new Error(`Too many workers, maximum is ${MAX_WORKERS}`);
  }
  if (data.length > MAX_SIZE) {
    throw new Error(`Array is too large, maximum size is ${MAX_SIZE}`);
  }
  const chunkIndices = getChunkIndices(data.length, numWorkers);
  const workers = chunkIndices.map((chunk) => {
    return createWorker(data, chunk, workerScript);
  });
  const chunkResults = await Promise.all(workers);
  const result = await createWorker(
    chunkResults,
    { start: 0, end: chunkResults.length },
    workerScript
  );
  return result;
}
