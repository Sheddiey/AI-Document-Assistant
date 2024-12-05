import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  fileContent: null, // Optional: Extracted content (if applicable)
  fileName: null,
  fileType: "",
  fileSize: null,
  rawFile: null, // Add raw file to store the actual file object
  valid: true,
};

const fileUploadSlice = createSlice({
  name: "fileUpload",
  initialState,
  reducers: {
    startUpload: (state) => {
      state.loading = true;
      state.error = null;
      state.valid = true;
    },
    uploadSuccess: (state, action) => {
      state.loading = false;
      const { content, name, type, size, file } = action.payload;
      state.fileContent = content || null; // Extracted content if provided
      state.fileName = name;
      state.fileType = type;
      state.fileSize = size;
      state.rawFile = file; // Store the raw file object
      state.valid = true;
    },
    uploadError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.valid = false;
    },
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.fileContent = null;
      state.fileName = null;
      state.fileType = null;
      state.fileSize = null;
      state.rawFile = null;
      state.valid = true;
    },
  },
});

export const { startUpload, uploadSuccess, uploadError, resetState } =
  fileUploadSlice.actions;

export default fileUploadSlice.reducer;
