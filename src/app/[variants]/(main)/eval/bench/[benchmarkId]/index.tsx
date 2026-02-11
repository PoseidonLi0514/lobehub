'use client';

import { Button, Flexbox, Icon } from '@lobehub/ui';
import { Badge, Card } from 'antd';
import { createStaticStyles } from 'antd-style';
import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Database,
  Download,
  Gauge,
  LoaderPinwheel,
  Server,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  User,
  Volleyball,
  Zap,
} from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { lambdaClient } from '@/libs/trpc/client';
import { useEvalStore } from '@/store/eval';

import RunCreateModal from './features/RunCreateModal';
import RunsTab from './features/RunsTab';
import TestCasesTab from './features/TestCasesTab';

const SYSTEM_ICONS = [
  LoaderPinwheel,
  Volleyball,
  Server,
  Target,
  Award,
  Trophy,
  Activity,
  BarChart3,
  TrendingUp,
  Gauge,
  Zap,
];

const getSystemIcon = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SYSTEM_ICONS[hash % SYSTEM_ICONS.length];
};

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    overflow-y: auto;
    padding: 24px 32px;
  `,
  iconBox: css`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;

    border-radius: 10px;
  `,
  statCard: css`
    .ant-card-body {
      padding: 16px;
    }
  `,
  statIcon: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;

    border-radius: 8px;
  `,
  tabButton: css`
    position: relative;
    padding: 10px 16px;

    font-size: 14px;
    font-weight: 500;

    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 0.2s;

    &[data-active='true'] {
      color: ${cssVar.colorText};

      &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;

        height: 2px;

        background: ${cssVar.colorPrimary};

        content: '';
      }
    }

    &[data-active='false'] {
      color: ${cssVar.colorTextTertiary};

      &:hover {
        color: ${cssVar.colorText};
      }
    }
  `,
  tabsContainer: css`
    display: flex;
    align-items: center;

    border-bottom: 1px solid ${cssVar.colorBorderSecondary};
  `,
  title: css`
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: ${cssVar.colorText};
  `,
}));

const BenchmarkDetail = memo(() => {
  const { t } = useTranslation('eval');
  const { benchmarkId } = useParams<{ benchmarkId: string }>();
  const [benchmark, setBenchmark] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string>();
  const [activeTab, setActiveTab] = useState<'runs' | 'data'>('runs');
  const [createRunOpen, setCreateRunOpen] = useState(false);
  const deleteBenchmark = useEvalStore((s) => s.deleteBenchmark);

  const systemIcon = useMemo(
    () => (benchmarkId ? getSystemIcon(benchmarkId) : Server),
    [benchmarkId],
  );

  useEffect(() => {
    if (!benchmarkId) return;
    lambdaClient.agentEval.getBenchmark.query({ id: benchmarkId }).then(setBenchmark);
    lambdaClient.agentEval.listDatasets.query({ benchmarkId }).then((result) => {
      setDatasets(result);
      if (result.length > 0) setActiveDatasetId(result[0].id);
    });
  }, [benchmarkId]);

  const useFetchRuns = useEvalStore((s) => s.useFetchRuns);
  const runList = useEvalStore((s) => s.runList);
  useFetchRuns(activeDatasetId);

  const completedRuns = runList.filter((r: any) => r.status === 'completed');
  const bestScore =
    completedRuns.length > 0 ? Math.max(...completedRuns.map((r: any) => r.metrics?.score || 0)) : null;

  const handleDelete = async () => {
    if (!benchmarkId) return;
    await deleteBenchmark(benchmarkId);
    window.location.href = '/eval';
  };

  if (!benchmark) return null;

  const totalCases = datasets.reduce((sum, ds) => sum + (ds.testCaseCount || 0), 0);

  return (
    <Flexbox className={styles.container} gap={24} height="100%" width="100%">
      {/* Back + Header */}
      <Flexbox gap={16}>
        <Link
          style={{
            alignItems: 'center',
            color: 'var(--ant-color-text-tertiary)',
            display: 'inline-flex',
            fontSize: 14,
            gap: 4,
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          to="/eval"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--ant-color-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--ant-color-text-tertiary)';
          }}
        >
          <ArrowLeft size={16} />
          {t('benchmark.detail.backToOverview')}
        </Link>

        <Flexbox align="start" horizontal justify="space-between">
          <Flexbox align="start" gap={12} horizontal>
            <div
              className={styles.iconBox}
              style={{
                background:
                  benchmark.source === 'user'
                    ? 'var(--ant-color-success-bg)'
                    : 'var(--ant-color-primary-bg)',
              }}
            >
              <Icon
                icon={benchmark.source === 'user' ? User : systemIcon}
                size={20}
                style={{
                  color:
                    benchmark.source === 'user'
                      ? 'var(--ant-color-success)'
                      : 'var(--ant-color-primary)',
                }}
              />
            </div>
            <Flexbox gap={4}>
              <h1 className={styles.title}>{benchmark.name}</h1>
              {benchmark.description && (
                <p
                  style={{
                    color: 'var(--ant-color-text-tertiary)',
                    fontSize: 14,
                    margin: 0,
                    marginTop: 2,
                  }}
                >
                  {benchmark.description}
                </p>
              )}
            </Flexbox>
          </Flexbox>

          <Flexbox gap={8} horizontal>
            <Button icon={Download} size="small" variant="outlined">
              {t('benchmark.actions.export')}
            </Button>
            <Button
              icon={Trash2}
              onClick={handleDelete}
              size="small"
              style={{
                borderColor: 'var(--ant-color-error-border)',
                color: 'var(--ant-color-error)',
              }}
              variant="outlined"
            >
              {t('benchmark.actions.delete.title')}
            </Button>
          </Flexbox>
        </Flexbox>
      </Flexbox>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        <Card className={styles.statCard}>
          <Flexbox align="center" gap={12} horizontal>
            <div
              className={styles.statIcon}
              style={{ background: 'var(--ant-color-primary-bg)' }}
            >
              <Database
                size={16}
                style={{ color: 'var(--ant-color-primary)' }}
              />
            </div>
            <Flexbox gap={2}>
              <p
                style={{
                  color: 'var(--ant-color-text-tertiary)',
                  fontSize: 12,
                  margin: 0,
                }}
              >
                {t('benchmark.detail.stats.cases')}
              </p>
              <p
                style={{
                  color: 'var(--ant-color-text)',
                  fontSize: 20,
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {totalCases}
              </p>
            </Flexbox>
          </Flexbox>
        </Card>

        <Card className={styles.statCard}>
          <Flexbox align="center" gap={12} horizontal>
            <div
              className={styles.statIcon}
              style={{ background: 'var(--ant-color-primary-bg)' }}
            >
              <Activity
                size={16}
                style={{ color: 'var(--ant-color-primary)' }}
              />
            </div>
            <Flexbox gap={2}>
              <p
                style={{
                  color: 'var(--ant-color-text-tertiary)',
                  fontSize: 12,
                  margin: 0,
                }}
              >
                {t('benchmark.detail.stats.runs')}
              </p>
              <p
                style={{
                  color: 'var(--ant-color-text)',
                  fontSize: 20,
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {runList.length}
              </p>
            </Flexbox>
          </Flexbox>
        </Card>

        <Card className={styles.statCard}>
          <Flexbox align="center" gap={12} horizontal>
            <div
              className={styles.statIcon}
              style={{ background: 'var(--ant-color-success-bg)' }}
            >
              <CheckCircle2
                size={16}
                style={{ color: 'var(--ant-color-success)' }}
              />
            </div>
            <Flexbox gap={2}>
              <p
                style={{
                  color: 'var(--ant-color-text-tertiary)',
                  fontSize: 12,
                  margin: 0,
                }}
              >
                {t('benchmark.detail.stats.bestScore')}
              </p>
              <p
                style={{
                  color: 'var(--ant-color-text)',
                  fontSize: 20,
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {bestScore !== null ? bestScore.toFixed(1) : '--'}
              </p>
            </Flexbox>
          </Flexbox>
        </Card>

        <Card className={styles.statCard}>
          <Flexbox gap={8}>
            <p
              style={{
                color: 'var(--ant-color-text-tertiary)',
                fontSize: 12,
                margin: 0,
              }}
            >
              {t('benchmark.detail.stats.tags')}
            </p>
            <Flexbox gap={4} horizontal style={{ flexWrap: 'wrap' }}>
              {benchmark.tags?.slice(0, 3).map((tag: string) => (
                <Badge key={tag} style={{ fontSize: 12 }}>
                  {tag}
                </Badge>
              ))}
              {benchmark.tags?.length > 3 && (
                <Badge style={{ fontSize: 12 }}>+{benchmark.tags.length - 3}</Badge>
              )}
            </Flexbox>
          </Flexbox>
        </Card>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={styles.tabButton}
          data-active={activeTab === 'runs'}
          onClick={() => setActiveTab('runs')}
        >
          {t('benchmark.detail.tabs.runs')}
          <Badge
            style={{
              fontSize: 10,
              marginLeft: 8,
            }}
          >
            {runList.length}
          </Badge>
        </button>
        <button
          className={styles.tabButton}
          data-active={activeTab === 'data'}
          onClick={() => setActiveTab('data')}
        >
          {t('benchmark.detail.tabs.data')}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'runs' ? (
        <RunsTab
          benchmarkId={benchmarkId!}
          datasetId={activeDatasetId}
          onCreateRun={() => setCreateRunOpen(true)}
        />
      ) : (
        activeDatasetId && <TestCasesTab datasetId={activeDatasetId} />
      )}

      {activeDatasetId && (
        <RunCreateModal
          benchmarkId={benchmarkId!}
          datasetId={activeDatasetId}
          onClose={() => setCreateRunOpen(false)}
          open={createRunOpen}
        />
      )}
    </Flexbox>
  );
});

export default BenchmarkDetail;
