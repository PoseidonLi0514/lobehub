'use client';

import { Flexbox } from '@lobehub/ui';
import { Divider, Typography } from 'antd';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useEvalStore } from '@/store/eval';
import { runSelectors } from '@/store/eval';

import CaseResultsTable from './features/CaseResultsTable';
import StatusDonut from './features/Charts/StatusDonut';
import RunHeader from './features/RunHeader';
import StatsCards from './features/StatsCards';

const RunDetail = memo(() => {
  const { t } = useTranslation('eval');
  const { benchmarkId, runId } = useParams<{ benchmarkId: string; runId: string }>();
  const useFetchRunDetail = useEvalStore((s) => s.useFetchRunDetail);
  const useFetchRunResults = useEvalStore((s) => s.useFetchRunResults);
  const runDetail = useEvalStore(runSelectors.runDetail);
  const runResults = useEvalStore(runSelectors.runResults);
  const isActive = useEvalStore(runSelectors.isRunActive);
  const refreshRunDetail = useEvalStore((s) => s.refreshRunDetail);
  const pollingRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useFetchRunDetail(runId!);
  useFetchRunResults(runId!);

  // Polling when run is active
  useEffect(() => {
    if (isActive && runId) {
      pollingRef.current = setInterval(() => {
        refreshRunDetail(runId);
      }, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isActive, runId, refreshRunDetail]);

  if (!runDetail) return null;

  return (
    <Flexbox gap={24} padding={24} style={{ margin: '0 auto', maxWidth: 1200, width: '100%' }}>
      <RunHeader benchmarkId={benchmarkId!} run={runDetail} />

      <StatsCards metrics={runDetail.metrics} />

      {runDetail.metrics &&
        (runDetail.metrics.passedCases > 0 || runDetail.metrics.failedCases > 0) && (
          <Flexbox gap={12}>
            <Typography.Text strong>{t('run.detail.charts')}</Typography.Text>
            <StatusDonut
              failedCases={runDetail.metrics.failedCases}
              passedCases={runDetail.metrics.passedCases}
            />
          </Flexbox>
        )}

      <Divider />

      <Typography.Text strong>{t('run.detail.caseResults')}</Typography.Text>
      {runResults?.results && (
        <CaseResultsTable
          benchmarkId={benchmarkId!}
          results={runResults.results}
          runId={runId!}
        />
      )}
    </Flexbox>
  );
});

export default RunDetail;
