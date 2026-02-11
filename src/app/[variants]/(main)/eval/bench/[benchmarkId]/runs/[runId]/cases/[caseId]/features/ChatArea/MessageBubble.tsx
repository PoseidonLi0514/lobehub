'use client';

import { Flexbox } from '@lobehub/ui';
import { Typography } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';

interface MessageBubbleProps {
  message: {
    content: string;
    role: string;
  };
}

const MessageBubble = memo<MessageBubbleProps>(({ message }) => {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';

  const bgColor = isUser
    ? theme.colorPrimaryBg
    : isTool
      ? theme.colorWarningBg
      : theme.colorFillTertiary;

  return (
    <Flexbox
      align={isUser ? 'flex-end' : 'flex-start'}
      style={{ width: '100%' }}
    >
      <Flexbox
        padding={12}
        style={{
          background: bgColor,
          borderRadius: 12,
          maxWidth: '80%',
        }}
      >
        <Typography.Text style={{ fontSize: 11, marginBottom: 4 }} type="secondary">
          {message.role}
        </Typography.Text>
        <Typography.Text style={isTool ? { fontFamily: 'monospace', fontSize: 12 } : undefined}>
          {message.content}
        </Typography.Text>
      </Flexbox>
    </Flexbox>
  );
});

export default MessageBubble;
