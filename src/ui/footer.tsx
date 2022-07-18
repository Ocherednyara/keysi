import { Box, Text } from 'ink';
import { useState, useEffect, useRef } from 'react';
import { getCurrentVersionInfo, getVersionInfo } from '../core/get-updates';

export const Footer: React.FC = () => {
  const [version, setVersion] = useState('');
  const [latestVersion, setLatestVersion] = useState<null | string>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    setVersion(getCurrentVersionInfo());
    getVersionInfo()
      .then((data) => {
        if (isMounted.current) {
          setLatestVersion(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  });

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" justifyContent="space-between">
        <Box flexDirection="column">
          <Text dimColor>[Enter] Next test</Text>
          <Text dimColor>[Tab] Switch mode</Text>
          <Text dimColor>[Esc] Exit</Text>
        </Box>
        <Box alignSelf="flex-end" flexDirection="column" alignItems="flex-end">
          <Text dimColor>Version: {version}</Text>
        </Box>
      </Box>
      <Box height={1}></Box>
      {latestVersion !== null && version !== latestVersion ? (
        <Text color={'yellow'}>
          Update available, run{' '}
          <Text bold color={'yellowBright'}>
            `npm update keysi`
          </Text>
        </Text>
      ) : null}
    </Box>
  );
};
