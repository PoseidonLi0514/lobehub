import type { EvalStore } from '@/store/eval/store';

const runList = (s: EvalStore) => s.runList;
const runDetail = (s: EvalStore) => s.runDetail;
const runResults = (s: EvalStore) => s.runResults;
const isCreatingRun = (s: EvalStore) => s.isCreatingRun;
const isLoadingRuns = (s: EvalStore) => s.isLoadingRuns;
const isLoadingRunDetail = (s: EvalStore) => s.isLoadingRunDetail;
const isRunActive = (s: EvalStore) =>
  s.runDetail?.status === 'running' || s.runDetail?.status === 'pending';

export const runSelectors = {
  isCreatingRun,
  isLoadingRunDetail,
  isLoadingRuns,
  isRunActive,
  runDetail,
  runList,
  runResults,
};
