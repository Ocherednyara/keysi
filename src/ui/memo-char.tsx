import React, { memo } from 'react';
import { Text } from 'ink';

export const MemoChar: React.FC<{
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
