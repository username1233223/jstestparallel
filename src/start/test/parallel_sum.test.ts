import {
  generateRandomSharedArray,
  makeSharedArray,
  parallelRun,
} from '../parallel_runner/parallelRun';
const SUM_SCRIPT_NAME: string = 'workerSum';

describe('parallelRun', () => {
  test('correctly sums an array of numbers', async () => {
    const data = makeSharedArray([1, 2, 3, 4, 5]);
    const result = await parallelRun(data, 2, SUM_SCRIPT_NAME);
    expect(result).toBe(15);
  });

  test('returns 0 for an empty array', async () => {
    const data = makeSharedArray([]);
    const result = await parallelRun(data, 2, SUM_SCRIPT_NAME);
    expect(result).toBe(0);
  });

  test('correctly handles array with single element', async () => {
    const data = makeSharedArray([63]);
    const result = await parallelRun(data, 2, SUM_SCRIPT_NAME);
    expect(result).toBe(63);
  });

  test('correctly sums array with negative numbers', async () => {
    const data = makeSharedArray([-1, -2, 3, -4, 5]);
    const result = await parallelRun(data, 3, SUM_SCRIPT_NAME);
    expect(result).toBe(1);
  });

  test('produces the same result with different number of workers', async () => {
    const data = generateRandomSharedArray(1000);
    const expectedSum = data.reduce((a, b) => a + b, 0);
    const maxWorkers = 10;
    for (let numWorkers = 1; numWorkers <= maxWorkers; numWorkers++) {
      const result = await parallelRun(data, numWorkers, SUM_SCRIPT_NAME);
      expect(result).toBe(expectedSum);
    }
  });

  test('correctly handles large arrays', async () => {
    const data = generateRandomSharedArray(20000000);
    const expectedSum = data.reduce((a, b) => a + b, 0);
    const result = await parallelRun(data, 10, SUM_SCRIPT_NAME);
    expect(result).toBe(expectedSum);
  }, 10000);

  test('throws error when numWorkers is less than 1', async () => {
    const data = makeSharedArray([1, 2, 3]);
    await expect(parallelRun(data, 0, SUM_SCRIPT_NAME)).rejects.toThrow();
  });

  test(`parallel execution is faster than sequential for large arrays.`, async () => {
    const data = generateRandomSharedArray(200000000);

    const sequentialStart = performance.now();
    data.reduce((a, b) => a + b, 0);
    const sequentialTime = performance.now() - sequentialStart;

    const parallelStart = performance.now();
    await parallelRun(data, 8, SUM_SCRIPT_NAME);
    const parallelTime = performance.now() - parallelStart;
    console.log(`Parallel time: ${parallelTime} Sequential time: ${sequentialTime}`);
    expect(parallelTime).toBeLessThan(sequentialTime);
  }, 100000);
});
