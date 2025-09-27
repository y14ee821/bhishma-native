import { createSlice } from "@reduxjs/toolkit";

const utilsSlice = createSlice({
  name: "utilsSlice",
  initialState: {
    error: false,
  },

  reducers: {
    setError(state, action) {
      return {
        ...state,
        error: action.payload.error,
      };
    },

    clearError(state, action) {
      return { ...state, error: false };
    },
  },
});

export const { setError, clearError } = utilsSlice.actions;
export const utilsReducer = utilsSlice.reducer;