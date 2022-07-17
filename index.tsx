#!/usr/bin/env node

import React, { useState, useEffect, useMemo, memo } from 'react';
import { Box, render, Spacer, Text, useInput, useStdin } from 'ink';
import fs from 'fs';
import path from 'path';

const quotesBuffer = fs.readFileSync(path.join(__dirname, '../english.json'));
const quotes: {
  text: string;
  source: string;
}[] = JSON.parse(quotesBuffer as any);

const wordsBuffers = fs.readFileSync(
  path.join(__dirname, '../english-words.json'),
);
const words: string[] = JSON.parse(wordsBuffers as any);

const MemoChar: React.FC<{
  inverse: boolean;
  color?: string;
  underline: boolean;
  char: string;
}> = memo(({ inverse, color, underline, char }) => {
  return (
    <Text underline={underline} color={color} inverse={inverse}>
      {char}
    </Text>
  );
});

const TypingGame: React.FC = () => {
  const [input, setInput] = useState('');
  const [test, setTest] = useState<{
    text: string;
    source?: string;
  }>({ text: '', source: undefined });
  const [beginTime, setBeginTime] = useState<null | Date>(null);
  const [mode, setMode] = useState<'Words' | 'Quotes'>('Quotes');

  const { setRawMode } = useStdin();

  const generateTest = (): { text: string; source?: string } => {
    if (mode === 'Quotes') {
      return quotes[Math.floor(Math.random() * quotes.length)];
    }

    const wordAmount = 100;
    let wordsArray: string[] = [];
    for (let i = 0; i < wordAmount; ++i) {
      wordsArray = [
        ...wordsArray,
        words[Math.floor(Math.random() * words.length)],
      ];
    }

    return { text: wordsArray.join(' ') };
  };

  useEffect(() => {
    setRawMode(true);

    return () => {
      setRawMode(false);
    };
  }, []);

  useEffect(() => {
    setTest(generateTest());
    setInput('');
    setBeginTime(null);
  }, [mode]);

  useInput((value, key) => {
    if (key.tab) {
      setMode(mode === 'Quotes' ? 'Words' : 'Quotes');
      return;
    }
    if (key.return) {
      setTest(generateTest());
      setInput('');
      setBeginTime(null);
      return;
    }
    if (key.backspace || key.delete) {
      setInput(input.slice(0, -1));
      return;
    }
    setInput(input + value);
  });

  useEffect(() => {
    if (input.length > test.text.length || !test.text.length) {
      setTest(generateTest());
      setInput('');
      setBeginTime(null);
    }
    if (input.length === 1 && !beginTime) {
      setBeginTime(new Date());
    }
  });

  const quoteArray = useMemo(() => test.text.split(''), [test]);

  const timePassed = beginTime && new Date().getTime() - beginTime.getTime();

  const accuracy = useMemo(() => {
    let hits = 0;
    for (let i = 0; i < input.length; ++i) {
      if (test.text[i] === input[i]) {
        hits++;
      }
    }
    return (100 * hits) / input.length;
  }, [input]);

  const wpm = timePassed
    ? (accuracy / 100) * (input.length / 4.7 / (timePassed / 60000))
    : null;

  return (
    <Box
      padding={1}
      paddingX={3}
      flexDirection="column"
      borderStyle={'round'}
      borderColor={'magenta'}
    >
      <Box alignSelf={'flex-end'}>
        <Text color={'cyanBright'}>{mode}</Text>
      </Box>
      <Box flexDirection="column">
        <Box>
          <Text dimColor>Accuracy: </Text>
          <Text dimColor bold>
            {!!input.length && wpm !== null ? `${accuracy.toFixed(0)}%` : null}
          </Text>
        </Box>
        <Box width={8}>
          <Text dimColor>WPM: </Text>
          <Text bold>{!!input.length && wpm?.toFixed(0)}</Text>
        </Box>
      </Box>
      <Box height={1}></Box>
      <Box flexDirection="row">
        <Text>
          {quoteArray.map((char, index) => {
            const isCorrect = input[index] === char;
            const isWrong = input[index] !== char && input.length > index;

            const primaryColor = isCorrect
              ? 'magentaBright'
              : isWrong
              ? 'yellow'
              : undefined;
            const inverse = input.length === index && index > 0;

            return (
              <MemoChar
                underline={isWrong}
                key={index}
                color={primaryColor}
                char={char}
                inverse={inverse}
              ></MemoChar>
            );
          })}
        </Text>
      </Box>
      <Box minHeight={1} alignSelf="flex-end">
        {test.source ? (
          <Text italic dimColor>
            - {test.source}
          </Text>
        ) : null}
      </Box>
      <Box flexDirection="column">
        <Text dimColor>[Enter] Next test</Text>
        <Text dimColor>[Tab] Switch mode</Text>
      </Box>
    </Box>
  );
};

const { clear } = render(<TypingGame />);

clear();
