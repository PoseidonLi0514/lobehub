export interface RunSliceState {
  isCreatingRun: boolean;
  isLoadingRunDetail: boolean;
  isLoadingRunResults: boolean;
  isLoadingRuns: boolean;
  runDetail: any | null;
  runList: any[];
  runResults: any | null;
}

export const runInitialState: RunSliceState = {
  isCreatingRun: false,
  isLoadingRunDetail: false,
  isLoadingRunResults: false,
  isLoadingRuns: false,
  runDetail: null,
  runList: [],
  runResults: null,
};
