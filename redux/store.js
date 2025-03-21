import { configureStore } from '@reduxjs/toolkit';
import { mainReducer } from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: mainReducer,
  },
});

export const selectCounter = state => state.counter.counter;
export const selectStep = state => state.counter.step;
