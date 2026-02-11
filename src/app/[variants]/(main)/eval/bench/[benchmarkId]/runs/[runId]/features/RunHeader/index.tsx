'use client';

import { ActionIcon } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { Popconfirm, Progress, Typography } from 'antd';
import { ArrowLeft, Square, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import StatusBadge from '@/app/[variants]/(main)/eval/features/StatusBadge';
import { useEvalStore } from '@/store/eval';

interface RunHeaderProps {
  benchmarkId: string;
  run: any;
}

const RunHeader = memo<RunHeaderProps>(({ run, benchmarkId }) => {
  const { t } = useTranslation('eval');
  const navigate = useNavigate();
  const abortRun = useEvalStore((s) => s.abortRun);
  const deleteRun = useEvalStore((s) => s.deleteRun);
  const isActive = run.status === 'running' || run.status === 'pending';

  const handleAbort = async () => {
    await abortRun(run.id);
  };

  const handleDelete = async () => {
    await deleteRun(run.id);
    navigate(`/eval/bench/${benchmarkId}`);
  };

  return (
    <Flexbox gap={12}>
      <Flexbox align="center" gap={12} horizontal>
        <ActionIcon
          icon={ArrowLeft}
          onClick={() => navigate(`/eval/bench/${benchmarkId}`)}
          size="small"
        />
        <Flexbox flex={1} gap={4}>
          <Flexbox align="center" gap={8} horizontal>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {run.name || run.id.slice(0, 8)}
            </Typography.Title>
            <StatusBadge status={run.status} />
          </Flexbox>
        </Flexbox>
        <Flexbox gap={4} horizontal>
          {isActive && (
            <Popconfirm onConfirm={handleAbort} title={t('run.actions.abort.confirm')}>
              <ActionIcon icon={Square} size="small" title={t('run.actions.abort')} />
            </Popconfirm>
          )}
          <Popconfirm onConfirm={handleDelete} title={t('run.actions.delete.confirm')}>
            <ActionIcon icon={Trash2} size="small" title={t('run.actions.delete')} />
          </Popconfirm>
        </Flexbox>
      </Flexbox>
      {isActive && run.metrics && (
        <Progress
          percent={
            run.metrics.totalCases
              ? Math.round(
                  ((run.metrics.passedCases + run.metrics.failedCases) / run.metrics.totalCases) *
                    100,
                )
              : 0
          }
          status="active"
        />
      )}
    </Flexbox>
  );
});

export default RunHeader;
