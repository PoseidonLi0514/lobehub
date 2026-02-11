'use client';

import { Tag } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { Input, Select, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface CaseResultsTableProps {
  benchmarkId: string;
  results: any[];
  runId: string;
}

const CaseResultsTable = memo<CaseResultsTableProps>(({ results, benchmarkId, runId }) => {
  const { t } = useTranslation('eval');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredResults = useMemo(() => {
    let filtered = results;
    if (searchText) {
      filtered = filtered.filter((r: any) =>
        r.testCase?.content?.input?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r: any) => {
        const passed = r.topic?.metadata?.passed;
        return statusFilter === 'passed' ? passed : !passed;
      });
    }
    return filtered;
  }, [results, searchText, statusFilter]);

  const columns: ColumnsType<any> = [
    {
      dataIndex: ['testCase', 'content', 'input'],
      ellipsis: true,
      key: 'input',
      render: (text: string, record: any) => (
        <Link
          style={{ color: 'inherit' }}
          to={`/eval/bench/${benchmarkId}/runs/${runId}/cases/${record.testCaseId}`}
        >
          <Typography.Text ellipsis style={{ maxWidth: 400 }}>
            {text}
          </Typography.Text>
        </Link>
      ),
      title: t('table.columns.input'),
    },
    {
      key: 'status',
      render: (_: any, record: any) => {
        const passed = record.topic?.metadata?.passed;
        return passed === undefined ? (
          '-'
        ) : (
          <Tag color={passed ? 'success' : 'error'}>
            {passed ? t('table.filter.passed') : t('table.filter.failed')}
          </Tag>
        );
      },
      title: t('table.columns.status'),
      width: 100,
    },
    {
      key: 'score',
      render: (_: any, record: any) => {
        const score = record.topic?.metadata?.totalScore;
        return score !== undefined ? score.toFixed(2) : '-';
      },
      title: t('table.columns.score'),
      width: 100,
    },
    {
      key: 'duration',
      render: (_: any, record: any) => {
        const duration = record.topic?.metadata?.duration;
        return duration !== undefined ? `${(duration / 1000).toFixed(1)}s` : '-';
      },
      title: t('table.columns.duration'),
      width: 100,
    },
    {
      dataIndex: ['testCase', 'metadata', 'difficulty'],
      key: 'difficulty',
      render: (difficulty: string) =>
        difficulty ? <Tag>{t(`difficulty.${difficulty}` as any)}</Tag> : '-',
      title: t('table.columns.difficulty'),
      width: 100,
    },
  ];

  return (
    <Flexbox gap={12}>
      <Flexbox gap={8} horizontal>
        <Input.Search
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t('table.search.placeholder')}
          style={{ width: 240 }}
        />
        <Select
          onChange={setStatusFilter}
          options={[
            { label: t('table.filter.all'), value: 'all' },
            { label: t('table.filter.passed'), value: 'passed' },
            { label: t('table.filter.failed'), value: 'failed' },
          ]}
          style={{ width: 120 }}
          value={statusFilter}
        />
      </Flexbox>
      <Table columns={columns} dataSource={filteredResults} rowKey="testCaseId" size="small" />
    </Flexbox>
  );
});

export default CaseResultsTable;
