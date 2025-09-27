import { configureStore } from "@reduxjs/toolkit";

import { utilsReducer } from "./utilsSlice";

export const store = configureStore({
  reducer: {
    utils: utilsReducer,
  },
});