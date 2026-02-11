'use client';

import { ActionIcon } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { ArrowLeft } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useEvalStore } from '@/store/eval';
import { runSelectors } from '@/store/eval';

import CaseBanner from './features/CaseBanner';
import ChatArea from './features/ChatArea';
import InfoSidebar from './features/InfoSidebar';

const CaseDetail = memo(() => {
  const { benchmarkId, runId, caseId } = useParams<{
    benchmarkId: string;
    caseId: string;
    runId: string;
  }>();
  const navigate = useNavigate();
  const runResults = useEvalStore(runSelectors.runResults);
  const [caseResult, setCaseResult] = useState<any>(null);

  useEffect(() => {
    if (runResults?.results) {
      const found = runResults.results.find((r: any) => r.testCaseId === caseId);
      setCaseResult(found);
    }
  }, [runResults, caseId]);

  if (!caseResult) return null;

  const metadata = caseResult.topic?.metadata;
  const messages = caseResult.topic?.messages || [];

  return (
    <Flexbox height="100%" style={{ overflow: 'hidden' }}>
      <Flexbox padding="16px 24px">
        <ActionIcon
          icon={ArrowLeft}
          onClick={() => navigate(`/eval/bench/${benchmarkId}/runs/${runId}`)}
          size="small"
        />
      </Flexbox>
      <CaseBanner metadata={metadata} />
      <Flexbox flex={1} horizontal style={{ overflow: 'hidden' }}>
        <Flexbox flex={1} padding={24} style={{ overflowY: 'auto' }}>
          <ChatArea messages={messages} />
        </Flexbox>
        <InfoSidebar metadata={metadata} testCase={caseResult.testCase} />
      </Flexbox>
    </Flexbox>
  );
});

export default CaseDetail;
