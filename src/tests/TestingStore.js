import { configureStore } from "@reduxjs/toolkit";
import fileUploadReducer from "../state/fileUploadSlice";

const createTestStore = (initialState) => {
  return configureStore({
    reducer: {
      fileUpload: fileUploadReducer,
    },
    preloadedState: initialState, // Use `preloadedState` instead of `initialState`
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export default createTestStore;
