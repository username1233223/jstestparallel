import { generateRandomSharedArray, MAX_SIZE, parallelRun } from './parallel_runner/parallelRun';
const SUM_SCRIPT_NAME: string = 'workerSum';

async function main(): Promise<void> {
  const arraySize = MAX_SIZE;
  const maxWorkers = 5;

  const randomArray = generateRandomSharedArray(arraySize);
  console.log(`Array size: ${arraySize}`);
  const startTime = performance.now();
  const sum = await parallelRun(randomArray, maxWorkers, SUM_SCRIPT_NAME);
  const endTime = performance.now();

  console.log(`Workers: ${maxWorkers}, Sum: ${sum}, Time: ${endTime - startTime} ms`);
}

main().catch(console.error);
