"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthModalMode = "login" | "register";

type UiSliceState = {
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  mobileSidebarOpen: boolean;
};

const initialState: UiSliceState = {
  authModalOpen: false,
  authModalMode: "login",
  mobileSidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openAuthModal(state, action: PayloadAction<AuthModalMode | undefined>) {
      state.authModalOpen = true;
      if (action.payload) state.authModalMode = action.payload;
    },
    closeAuthModal(state) {
      state.authModalOpen = false;
    },
    toggleAuthModalMode(state) {
      state.authModalMode =
        state.authModalMode === "login" ? "register" : "login";
    },
    setMobileSidebar(state, action: PayloadAction<boolean>) {
      state.mobileSidebarOpen = action.payload;
    },
  },
});

export const uiReducer = uiSlice.reducer;
export const uiActions = uiSlice.actions;
