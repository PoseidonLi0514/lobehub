'use client';

import { Tag } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { Divider, Typography } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface InfoSidebarProps {
  metadata?: any;
  testCase?: any;
}

const InfoSidebar = memo<InfoSidebarProps>(({ testCase, metadata }) => {
  const { t } = useTranslation('eval');
  const theme = useTheme();

  return (
    <Flexbox
      gap={16}
      padding={16}
      style={{
        background: theme.colorBgContainer,
        borderLeft: `1px solid ${theme.colorBorderSecondary}`,
        height: '100%',
        overflowY: 'auto',
        width: 320,
      }}
    >
      {testCase?.content?.input && (
        <Flexbox gap={4}>
          <Typography.Text strong>{t('caseDetail.input')}</Typography.Text>
          <Typography.Paragraph style={{ margin: 0 }}>
            {testCase.content.input}
          </Typography.Paragraph>
        </Flexbox>
      )}

      <Divider style={{ margin: 0 }} />

      {testCase?.content?.expected && (
        <Flexbox gap={4}>
          <Typography.Text strong>{t('caseDetail.expected')}</Typography.Text>
          <Typography.Paragraph style={{ margin: 0 }}>
            {testCase.content.expected}
          </Typography.Paragraph>
        </Flexbox>
      )}

      <Divider style={{ margin: 0 }} />

      {metadata?.duration !== undefined && (
        <Flexbox gap={4}>
          <Typography.Text strong>{t('caseDetail.duration')}</Typography.Text>
          <Typography.Text>{(metadata.duration / 1000).toFixed(1)}s</Typography.Text>
        </Flexbox>
      )}

      {testCase?.metadata?.difficulty && (
        <Flexbox gap={4}>
          <Typography.Text strong>{t('caseDetail.difficulty')}</Typography.Text>
          <Tag>{t(`difficulty.${testCase.metadata.difficulty}` as any)}</Tag>
        </Flexbox>
      )}

      {metadata?.error && (
        <Flexbox gap={4}>
          <Typography.Text strong>{t('caseDetail.failureReason')}</Typography.Text>
          <Typography.Text type="danger">{metadata.error}</Typography.Text>
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default InfoSidebar;
