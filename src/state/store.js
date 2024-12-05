import { configureStore } from "@reduxjs/toolkit";
import fileUploadReducer from "./fileUploadSlice";

// Create and configure the Redux store
const store = configureStore({
  reducer: {
    fileUpload: fileUploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable the serializability check
    }),
});

export default store;
