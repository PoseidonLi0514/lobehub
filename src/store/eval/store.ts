import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import type { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { type EvalStoreState, initialState } from './initialState';
import { type BenchmarkAction, createBenchmarkSlice } from './slices/benchmark/action';
import { type RunAction, createRunSlice } from './slices/run/action';

export type EvalStore = EvalStoreState & BenchmarkAction & RunAction;

const createStore: StateCreator<EvalStore, [['zustand/devtools', never]]> = (
  set,
  get,
  store,
) => ({
  ...initialState,
  ...createBenchmarkSlice(set, get, store),
  ...createRunSlice(set, get, store),
});

const devtools = createDevtools('eval');

export const useEvalStore = createWithEqualityFn<EvalStore>()(devtools(createStore), shallow);
