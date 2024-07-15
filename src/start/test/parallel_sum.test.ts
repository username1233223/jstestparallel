import {
  generateFilledSharedArray,
  generateRandomSharedArray,
  makeSharedArray,
  MAX_SIZE,
  MAX_WORKERS,
  parallelRun,
} from '../parallel_runner/parallelRun';
const SUM_SCRIPT_NAME: string = 'workerSum';

describe('parallelRun', () => {
  test('correctly sums an array of numbers', async () => {
    const data = makeSharedArray([1, 2, 3, 4, 5]);
    const result = await parallelRun(data, 2, SUM_SCRIPT_NAME);
    expect(result).toBe(15n);
  });

  test('returns 0 for an empty array', async () => {
    const data = makeSharedArray([]);
    const result = await parallelRun(data, 2, SUM_SCRIPT_NAME);
    expect(result).toBe(0n);
  });

  test('correctly handles array with single element', async () => {
    const data = makeSharedArray([63]);
    const result = await parallelRun(data, 2, SUM_SCRIPT_NAME);
    expect(result).toBe(63n);
  });
  test(`throws error when array size is bigger than ${MAX_SIZE}}`, async () => {
    const data = generateRandomSharedArray(MAX_SIZE + 1);
    await expect(parallelRun(data, 5, SUM_SCRIPT_NAME)).rejects.toThrow();
  });
  test('correctly sums array with negative numbers', async () => {
    const data = makeSharedArray([-1, -2, 3, -4, 5]);
    const result = await parallelRun(data, 3, SUM_SCRIPT_NAME);
    expect(result).toBe(1n);
  });

  test('produces the same result with different number of workers', async () => {
    const data = generateRandomSharedArray(1000);
    const expectedSum = data.reduce((a, b) => a + b, 0n);
    const maxWorkers = 5;
    for (let numWorkers = 1; numWorkers <= maxWorkers; numWorkers++) {
      const result = await parallelRun(data, numWorkers, SUM_SCRIPT_NAME);
      expect(result).toBe(expectedSum);
    }
  });

  test('correctly handles large arrays', async () => {
    const data = generateRandomSharedArray(MAX_SIZE);
    const expectedSum = data.reduce((a, b) => a + b, 0n);
    const result = await parallelRun(data, 5, SUM_SCRIPT_NAME);
    expect(result).toBe(expectedSum);
  }, 10000);

  test('check overflow', async () => {
    const data = generateFilledSharedArray(MAX_SIZE, Number.MAX_SAFE_INTEGER);
    const expectedSum = data.reduce((a, b) => a + b, 0n);
    const result = await parallelRun(data, 5, SUM_SCRIPT_NAME);
    expect(result).toBe(expectedSum);
  }, 10000);

  test('throws error when numWorkers is less than 1', async () => {
    const data = makeSharedArray([1, 2, 3]);
    await expect(parallelRun(data, 0, SUM_SCRIPT_NAME)).rejects.toThrow();
  });
  test(`throws error when numWorkers is more than ${MAX_WORKERS}`, async () => {
    const data = makeSharedArray([1, 2, 3]);
    await expect(parallelRun(data, 6, SUM_SCRIPT_NAME)).rejects.toThrow();
  });

  /*
  //This fails on max_size <= 1000000, works for larger size(e.g. 4000000, 10000000)

  test(`parallel execution is faster than sequential for large arrays.`, async () => {
    const data = generateRandomSharedArray(MAX_SIZE);

    const sequentialStart = performance.now();
    data.reduce((a, b) => a + b, 0n);
    const sequentialTime = performance.now() - sequentialStart;

    const parallelStart = performance.now();
    await parallelRun(data, 5, SUM_SCRIPT_NAME);
    const parallelTime = performance.now() - parallelStart;
    console.log(`Parallel time: ${parallelTime} Sequential time: ${sequentialTime}`);
    expect(parallelTime).toBeLessThan(sequentialTime);
  }, 100000);
  */
});
