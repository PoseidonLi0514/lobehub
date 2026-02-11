import { type BenchmarkSliceState, benchmarkInitialState } from './slices/benchmark/initialState';
import { type RunSliceState, runInitialState } from './slices/run/initialState';

export interface EvalStoreState extends BenchmarkSliceState, RunSliceState {}

export const initialState: EvalStoreState = {
  ...benchmarkInitialState,
  ...runInitialState,
};
