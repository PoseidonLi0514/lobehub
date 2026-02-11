'use client';

import { Tag } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { lambdaClient } from '@/libs/trpc/client';

interface TestCaseListProps {
  datasetId: string;
}

const TestCaseList = memo<TestCaseListProps>(({ datasetId }) => {
  const { t } = useTranslation('eval');
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await lambdaClient.agentEval.listTestCases.query({
          datasetId,
          limit: pagination.pageSize,
          offset: (pagination.current - 1) * pagination.pageSize,
        });
        setData(result.data);
        setTotal(result.total);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [datasetId, pagination.current, pagination.pageSize]);

  const columns: ColumnsType<any> = [
    {
      dataIndex: ['content', 'input'],
      ellipsis: true,
      key: 'input',
      render: (text: string) => (
        <Typography.Text ellipsis style={{ maxWidth: 400 }}>
          {text}
        </Typography.Text>
      ),
      title: t('table.columns.input'),
      width: 400,
    },
    {
      dataIndex: ['metadata', 'difficulty'],
      key: 'difficulty',
      render: (difficulty: string) =>
        difficulty ? <Tag>{t(`difficulty.${difficulty}` as any)}</Tag> : '-',
      title: t('table.columns.difficulty'),
      width: 100,
    },
  ];

  return (
    <Flexbox gap={12}>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          pageSize: pagination.pageSize,
          total,
        }}
        rowKey="id"
        size="small"
      />
    </Flexbox>
  );
});

export default TestCaseList;
