import { generateRandomSharedArray, parallelRun } from './parallel_runner/parallelRun';
const SUM_SCRIPT_NAME: string = 'workerSum';

async function main(): Promise<void> {
  const arraySize = 2000000000;
  const maxWorkers = 10;

  const randomArray = generateRandomSharedArray(arraySize);
  console.log(`Array size: ${arraySize}`);
  for (let numWorkers = 1; numWorkers <= maxWorkers; numWorkers++) {
    const startTime = performance.now();
    const sum = await parallelRun(randomArray, numWorkers, SUM_SCRIPT_NAME);
    const endTime = performance.now();

    console.log(`Workers: ${numWorkers}, Sum: ${sum}, Time: ${endTime - startTime} ms`);
  }
}

main().catch(console.error);
