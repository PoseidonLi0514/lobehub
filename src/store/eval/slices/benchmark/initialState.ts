export interface BenchmarkSliceState {
  benchmarkList: any[];
  benchmarkListInit: boolean;
  isCreatingBenchmark: boolean;
  isDeletingBenchmark: boolean;
  isLoadingBenchmarkList: boolean;
}

export const benchmarkInitialState: BenchmarkSliceState = {
  benchmarkList: [],
  benchmarkListInit: false,
  isCreatingBenchmark: false,
  isDeletingBenchmark: false,
  isLoadingBenchmarkList: false,
};
