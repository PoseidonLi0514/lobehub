'use client';

import { Flexbox } from '@lobehub/ui';
import { Progress, Typography } from 'antd';
import { memo } from 'react';

interface ScoreRingProps {
  label: string;
  score: number;
}

const ScoreRing = memo<ScoreRingProps>(({ label, score }) => {
  const percent = Math.round(score * 100);

  return (
    <Flexbox align="center" gap={4}>
      <Progress percent={percent} size={60} type="circle" />
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        {label}
      </Typography.Text>
    </Flexbox>
  );
});

export default ScoreRing;
