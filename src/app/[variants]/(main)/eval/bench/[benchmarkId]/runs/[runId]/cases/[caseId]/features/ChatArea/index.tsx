'use client';

import { Flexbox } from '@lobehub/ui';
import { Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import MessageBubble from './MessageBubble';

interface ChatAreaProps {
  messages: any[];
}

const ChatArea = memo<ChatAreaProps>(({ messages }) => {
  const { t } = useTranslation('eval');

  return (
    <Flexbox gap={12}>
      <Typography.Text strong>{t('caseDetail.chatArea.title')}</Typography.Text>
      <Flexbox gap={8} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {messages.map((msg: any, index: number) => (
          <MessageBubble key={index} message={msg} />
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default ChatArea;
