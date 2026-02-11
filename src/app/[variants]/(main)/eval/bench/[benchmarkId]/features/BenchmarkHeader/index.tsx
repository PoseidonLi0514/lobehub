'use client';

import { ActionIcon, Icon } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { Popconfirm, Typography } from 'antd';
import { ArrowLeft, Database, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useEvalStore } from '@/store/eval';

interface BenchmarkHeaderProps {
  benchmark: any;
}

const BenchmarkHeader = memo<BenchmarkHeaderProps>(({ benchmark }) => {
  const { t } = useTranslation('eval');
  const navigate = useNavigate();
  const deleteBenchmark = useEvalStore((s) => s.deleteBenchmark);

  const handleDelete = async () => {
    await deleteBenchmark(benchmark.id);
    navigate('/eval');
  };

  return (
    <Flexbox align="center" gap={12} horizontal>
      <ActionIcon icon={ArrowLeft} onClick={() => navigate('/eval')} size="small" />
      <Icon icon={Database} size={24} />
      <Flexbox flex={1} gap={4}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {benchmark.name}
        </Typography.Title>
        {benchmark.description && (
          <Typography.Text type="secondary">{benchmark.description}</Typography.Text>
        )}
      </Flexbox>
      <Popconfirm
        onConfirm={handleDelete}
        title={t('benchmark.actions.delete.confirm')}
      >
        <ActionIcon icon={Trash2} size="small" />
      </Popconfirm>
    </Flexbox>
  );
});

export default BenchmarkHeader;
