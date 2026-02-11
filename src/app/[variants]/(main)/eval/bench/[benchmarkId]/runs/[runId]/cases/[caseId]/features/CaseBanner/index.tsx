'use client';

import { Tag } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ScoreRing from './ScoreRing';

interface CaseBannerProps {
  metadata: any;
}

const CaseBanner = memo<CaseBannerProps>(({ metadata }) => {
  const { t } = useTranslation('eval');

  if (!metadata) return null;

  return (
    <Flexbox gap={16} padding={16} style={{ borderRadius: 8 }}>
      <Flexbox align="center" gap={12} horizontal>
        <Tag color={metadata.passed ? 'success' : 'error'}>
          {metadata.passed ? t('table.filter.passed') : t('table.filter.failed')}
        </Tag>
        {metadata.totalScore !== undefined && (
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('caseDetail.score')}: {metadata.totalScore.toFixed(2)}
          </Typography.Title>
        )}
      </Flexbox>

      {metadata.scores && metadata.scores.length > 0 && (
        <Flexbox gap={16} horizontal wrap="wrap">
          {metadata.scores.map((s: any) => (
            <ScoreRing key={s.rubricId} label={s.rubricId} score={s.score} />
          ))}
        </Flexbox>
      )}

      {metadata.error && (
        <Typography.Text type="danger">
          {t('caseDetail.failureReason')}: {metadata.error}
        </Typography.Text>
      )}
    </Flexbox>
  );
});

export default CaseBanner;
