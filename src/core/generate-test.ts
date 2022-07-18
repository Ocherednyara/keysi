import path from 'path';
import fs from 'fs';
import { environment } from '../../environment';

export type Test = {
  text: string;
  source?: string;
};

export type TestMode = 'Quotes' | 'Words';

const quotesBuffer = fs.readFileSync(
  path.join(environment.rootDirectory, './tests/english.json'),
);
const quotes: Test[] = JSON.parse(quotesBuffer as any);

const wordsBuffers = fs.readFileSync(
  path.join(environment.rootDirectory, './tests/english-words.json'),
);
const words: string[] = JSON.parse(wordsBuffers as any);

export function generateTest(mode: TestMode): Test {
  if (mode === 'Quotes') {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  const wordAmount = 50;
  let wordsArray: string[] = [];
  for (let i = 0; i < wordAmount; ++i) {
    wordsArray = [
      ...wordsArray,
      words[Math.floor(Math.random() * words.length)],
    ];
  }

  return { text: wordsArray.join(' ') };
}
