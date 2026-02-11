'use client';

import { Flexbox } from '@lobehub/ui';
import { Card, Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface StatsCardsProps {
  metrics?: {
    averageScore?: number;
    duration?: number;
    passRate?: number;
  };
}

const StatsCards = memo<StatsCardsProps>(({ metrics }) => {
  const { t } = useTranslation('eval');

  if (!metrics) return null;

  const cards = [
    {
      label: t('run.metrics.passRate'),
      value: metrics.passRate !== undefined ? `${Math.round(metrics.passRate * 100)}%` : '-',
    },
    {
      label: t('run.metrics.avgScore'),
      value: metrics.averageScore !== undefined ? metrics.averageScore.toFixed(2) : '-',
    },
    {
      label: t('run.metrics.duration'),
      value: metrics.duration !== undefined ? `${(metrics.duration / 1000).toFixed(1)}s` : '-',
    },
  ];

  return (
    <Flexbox gap={12} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
      {cards.map((card) => (
        <Card key={card.label} size="small">
          <Typography.Text style={{ fontSize: 12 }} type="secondary">
            {card.label}
          </Typography.Text>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {card.value}
          </Typography.Title>
        </Card>
      ))}
    </Flexbox>
  );
});

export default StatsCards;
