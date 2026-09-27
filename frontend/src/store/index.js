import { configureStore } from '@reduxjs/toolkit';
import deviationReducer from './deviationSlice';

export const store = configureStore({
  reducer: {
    deviation: deviationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore uploadedFile in serializability check if it's a File object
        ignoredActions: ['deviation/setUploadedFile', 'deviation/analyze/pending'],
        ignoredPaths: ['deviation.uploadedFile'],
      },
    }),
});

export default store;
