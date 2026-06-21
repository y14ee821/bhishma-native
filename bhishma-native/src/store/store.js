import { configureStore } from "@reduxjs/toolkit";

import { utilsReducer } from "./utilsSlice";
import { deviceControlReducer } from "./deviceControlSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    utils: utilsReducer,
    deviceControl: deviceControlReducer,
    auth: authReducer,
  },
});