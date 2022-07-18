import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useApp, useInput, useStdin } from 'ink';
import { Footer } from './footer';
import { MemoChar } from './memo-char';
import { generateTest, Test, TestMode } from '../core/generate-test';

export const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [test, setTest] = useState<Test>({ text: '', source: undefined });
  const [beginTime, setBeginTime] = useState<null | Date>(null);
  const [mode, setMode] = useState<TestMode>('Quotes');

  const { setRawMode } = useStdin();
  const { exit } = useApp();
  const [clearScreen, setClearScreen] = useState(false);

  useEffect(() => {
    setRawMode(true);

    return () => {
      setRawMode(false);
    };
  }, []);

  const setupTest = () => {
    setTest(generateTest(mode));
    setInput('');
    setBeginTime(null);
  };

  useEffect(() => {
    setupTest();
  }, [mode]);

  useEffect(() => {
    if (input.length > test.text.length || !test.text.length) {
      setupTest();
    }
    if (input.length === 1 && !beginTime) {
      setBeginTime(new Date());
    }
  });

  useInput((value, key) => {
    if (key.escape) {
      setClearScreen(true);
      exit();
    } else if (key.tab) {
      setMode(mode === 'Quotes' ? 'Words' : 'Quotes');
    } else if (key.return) {
      setupTest();
    } else if (key.backspace || key.delete) {
      setInput(input.slice(0, -1));
    } else {
      setInput(input + value);
    }
  });

  const testChars = useMemo(() => test.text.split(''), [test]);

  const accuracy = useMemo(() => {
    let hits = 0;
    for (let i = 0; i < input.length; ++i) {
      if (test.text[i] === input[i]) {
        hits++;
      }
    }
    return (100 * hits) / input.length;
  }, [input]);

  const timePassed = beginTime && new Date().getTime() - beginTime.getTime();
  const wpm = timePassed
    ? Math.min(
        (accuracy / 100) * (input.length / 4.7 / (timePassed / 60000)),
        999,
      )
    : null;

  if (clearScreen) {
    return null;
  }

  return (
    <Box
      padding={1}
      paddingX={3}
      flexDirection="column"
      borderStyle={'bold'}
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
          {testChars.map((char, index) => {
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
      <Box height={1}></Box>
      <Footer />
    </Box>
  );
};
