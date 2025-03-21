import { createSlice } from '@reduxjs/toolkit';

const initialValues = {
  counter: 1,
  step: 1,
};

export const slice = createSlice({
  name: 'counter',
  initialState: initialValues,
  reducers: {
    plus: (state, action) => {
      state.counter += state.step;
    },
    minus: (state, action) => {
      state.counter -= state.step;
    },
    reset: (state, action) => {
      return initialValues;
    },
    changeStep: (state, action) => {
      state.step = action.payload;
    },
  },
});

export const mainReducer = slice.reducer;
export const { plus, minus, reset, changeStep } = slice.actions;
