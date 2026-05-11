import { configureStore } from "@reduxjs/toolkit";

import { uiReducer } from "./uiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
    },
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
