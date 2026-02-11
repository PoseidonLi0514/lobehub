'use client';

import { DonutChart } from '@lobehub/charts';
import { useTheme } from 'antd-style';
import { memo } from 'react';

interface StatusDonutProps {
  failedCases: number;
  passedCases: number;
}

const StatusDonut = memo<StatusDonutProps>(({ passedCases, failedCases }) => {
  const theme = useTheme();

  const data = [
    { color: theme.colorSuccess, name: 'Passed', value: passedCases },
    { color: theme.colorError, name: 'Failed', value: failedCases },
  ];

  return (
    <DonutChart
      category="name"
      colors={[theme.colorSuccess, theme.colorError]}
      data={data}
      index="name"
      style={{ height: 200 }}
      variant="pie"
    />
  );
});

export default StatusDonut;
