import { createSlice } from "@reduxjs/toolkit";

const getStoredTheme = () => {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("theme") || "auto";
    }
  } catch (_) {}
  return "auto";
};

const utilsSlice = createSlice({
  name: "utilsSlice",
  initialState: {
    error: false,
    theme: getStoredTheme(),
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
    setTheme(state,action)
    {
      localStorage.setItem("theme",action.payload.theme);
      return {
        ...state,
        theme: action.payload.theme,
      };
      
    }
  },
});

export const { setError, clearError,setTheme } = utilsSlice.actions;
export const utilsReducer = utilsSlice.reducer;