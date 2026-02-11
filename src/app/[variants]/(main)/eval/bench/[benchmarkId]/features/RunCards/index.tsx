'use client';

import { ActionIcon, Empty, Flexbox } from '@lobehub/ui';
import { Typography } from 'antd';
import { Play, Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useEvalStore } from '@/store/eval';

import RunSummaryCard from './RunSummaryCard';

interface RunCardsProps {
  benchmarkId: string;
  datasetId?: string;
  onCreateRun: () => void;
}

const RunCards = memo<RunCardsProps>(({ datasetId, onCreateRun, benchmarkId }) => {
  const { t } = useTranslation('eval');
  const useFetchRuns = useEvalStore((s) => s.useFetchRuns);
  const runList = useEvalStore((s) => s.runList);
  useFetchRuns(datasetId);

  return (
    <Flexbox gap={12}>
      <Flexbox align="center" horizontal justify="space-between">
        <Typography.Text strong>{t('benchmark.detail.tabs.runs')}</Typography.Text>
        <ActionIcon icon={Plus} onClick={onCreateRun} size="small" title={t('run.actions.create')} />
      </Flexbox>
      {runList.length === 0 ? (
        <Empty description={t('benchmark.card.empty')} icon={Play} />
      ) : (
        <Flexbox gap={8}>
          {runList.map((run: any) => (
            <RunSummaryCard
              benchmarkId={benchmarkId}
              id={run.id}
              key={run.id}
              metrics={run.metrics}
              name={run.name}
              status={run.status}
            />
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default RunCards;
