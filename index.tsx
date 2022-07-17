#!/usr/bin/env node

import React, { useState, useEffect, useMemo, memo } from 'react';
import { Box, render, Text, useInput, useStdin } from 'ink';
import fs from 'fs';

const buffer = fs.readFileSync('english.json');
const quoteJson: {
  text: string;
  source: string;
}[] = JSON.parse(buffer as any);

const quotes = quoteJson;

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
  const [quote, setQuote] = useState<{
    text: string;
    source: string;
  }>({ text: '', source: '' });
  const [beginTime, setBeginTime] = useState<null | Date>(null);

  const { setRawMode } = useStdin();

  useEffect(() => {
    setRawMode(true);

    return () => {
      setRawMode(false);
    };
  });

  useInput((value, key) => {
    if (key.backspace && key.meta) {
      const words = input.split(' ');
      const previous = words.slice(0, -1);
      setInput(previous.join(' '));
    }
    if (key.return) {
      setQuote({ ...quotes[Math.floor(Math.random() * quotes.length)] });
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
    if (input.length > quote.text.length || !quote.text.length) {
      setQuote({ ...quotes[Math.floor(Math.random() * quotes.length)] });
      setInput('');
      setBeginTime(null);
    }
    if (input.length === 1 && !beginTime) {
      setBeginTime(new Date());
    }
  });

  const quoteArray = useMemo(() => quote.text.split(''), [quote]);

  const timePassed = beginTime && new Date().getTime() - beginTime.getTime();

  const accuracy = useMemo(() => {
    let hits = 0;
    for (let i = 0; i < input.length; ++i) {
      if (quote.text[i] === input[i]) {
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
      <Box
        height={1}
        width={8}
        flexDirection="row"
        justifyContent="space-between"
      >
        <Text bold>{wpm?.toFixed(0)}</Text>
        <Text bold> </Text>
        <Text dimColor bold>
          {wpm !== null ? `${accuracy.toFixed(0)}%` : null}
        </Text>
      </Box>
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
            const inverse = input.length === index;

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
      <Box alignSelf="flex-end">
        <Text italic dimColor>
          - {quote.source}
        </Text>
      </Box>
    </Box>
  );
};

render(<TypingGame />);
