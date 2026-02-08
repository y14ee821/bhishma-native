import { configureStore } from "@reduxjs/toolkit";

import { utilsReducer } from "./utilsSlice";
import { deviceReducer } from "./deviceSlice";
import { deviceControlReducer } from "./deviceControlSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    utils: utilsReducer,
    device: deviceReducer,
    deviceControl: deviceControlReducer,
    auth: authReducer,
  },
});