import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  analyzeDeviationApi,
  saveDeviationApi,
  getDeviationsApi,
  chatDeviationApi,
} from '../services/api';

const initialFormData = {
  site: '',
  date_of_occurrence: '',
  title: '',
  source: '',
  related_product: '',
  batch_lot_number: '',
  detailed_description: '',
  initial_impact: 'Product Quality',
  initial_severity: 'Major',
};

const initialFieldMeta = {
  site: null, // null | 'ai' | 'user'
  date_of_occurrence: null,
  title: null,
  source: null,
  related_product: null,
  batch_lot_number: null,
  detailed_description: null,
  initial_impact: null,
  initial_severity: null,
};

export const analyzeDeviationThunk = createAsyncThunk(
  'deviation/analyze',
  async ({ file, text }, { rejectWithValue }) => {
    try {
      const data = await analyzeDeviationApi({ file, text });
      return data;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to analyze deviation';
      return rejectWithValue(message);
    }
  }
);

export const saveDeviationThunk = createAsyncThunk(
  'deviation/save',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { formData, aiRecommendation, rawExtractedText, is_demo_mode } = getState().deviation;
      
      const payload = {
        site: formData.site || null,
        date_of_occurrence: formData.date_of_occurrence || null,
        title: formData.title,
        source: formData.source || null,
        related_product: formData.related_product || null,
        batch_lot_number: formData.batch_lot_number || null,
        detailed_description: formData.detailed_description,
        initial_impact: formData.initial_impact || null,
        initial_severity: formData.initial_severity || null,
        severity_reason: aiRecommendation.severity_reason || null,
        status: 'Draft',
        ai_generated: true,
        ai_confidence: aiRecommendation.confidence || null,
        raw_input_text: rawExtractedText || null,
      };

      const result = await saveDeviationApi(payload);
      return result;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to save deviation';
      return rejectWithValue(message);
    }
  }
);

export const fetchDeviationsThunk = createAsyncThunk(
  'deviation/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const list = await getDeviationsApi();
      return list;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const sendChatMessageThunk = createAsyncThunk(
  'deviation/sendChat',
  async (message, { getState, rejectWithValue }) => {
    try {
      const state = getState().deviation;
      const deviationContext = {
        ...state.formData,
        severity_reason: state.aiRecommendation.severity_reason,
      };
      const response = await chatDeviationApi({
        message,
        deviationContext,
        rawText: state.rawExtractedText,
        history: state.chatMessages,
      });
      return { userMessage: message, botResponse: response.response };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Chat error');
    }
  }
);

const deviationSlice = createSlice({
  name: 'deviation',
  initialState: {
    // Form fields (Left side)
    formData: { ...initialFormData },
    fieldMeta: { ...initialFieldMeta }, // Tracks 'ai' vs 'user' origin

    // AI Extracted recommendations
    aiRecommendation: {
      severity_reason: '',
      confidence: null,
      key_findings: [],
      immediate_actions: [],
      processing_time_ms: 0,
      steps_executed: [],
    },

    // Raw input text & document state (Right side)
    pastedText: '',
    uploadedFile: null,
    rawExtractedText: '',

    // Analysis workflow UI state
    analyzing: false,
    analysisStep: 0,
    analysisComplete: false,
    is_demo_mode: false,
    model_used: 'llama-3.3-70b-versatile',

    // Save & validation state
    saving: false,
    saveSuccess: false,
    savedRecord: null,

    // Feedback & errors
    error: null,
    toast: null,

    // Chat assistant
    chatMessages: [
      {
        role: 'assistant',
        content: 'Hello! I am your AI Deviation Assistant. Upload a batch record or paste deviation notes on the right, and I will analyze the incident, extract critical parameters, recommend impact/severity, and populate the intake form.',
      },
    ],
    chatLoading: false,

    // Navigation & Module counts
    activeTab: 'Deviations',
    moduleCounts: {
      deviations: 0,
      capas: 0,
      changeControls: 0,
      audits: 0,
      documents: 0,
    },

    // Saved records modal
    savedModalOpen: false,
    savedList: [],
    savedListLoading: false,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setModuleCounts: (state, action) => {
      state.moduleCounts = { ...state.moduleCounts, ...action.payload };
    },
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
      // Mark as user-edited if user types in it
      state.fieldMeta[field] = 'user';
    },
    setPastedText: (state, action) => {
      state.pastedText = action.payload;
    },
    setUploadedFile: (state, action) => {
      state.uploadedFile = action.payload;
    },
    removeUploadedFile: (state) => {
      state.uploadedFile = null;
    },
    setAnalysisStep: (state, action) => {
      state.analysisStep = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
    setToast: (state, action) => {
      state.toast = action.payload;
    },
    setSavedModalOpen: (state, action) => {
      state.savedModalOpen = action.payload;
    },
    resetForm: (state) => {
      state.formData = { ...initialFormData };
      state.fieldMeta = { ...initialFieldMeta };
      state.aiRecommendation = {
        severity_reason: '',
        confidence: null,
        key_findings: [],
        immediate_actions: [],
        processing_time_ms: 0,
        steps_executed: [],
      };
      state.pastedText = '';
      state.uploadedFile = null;
      state.rawExtractedText = '';
      state.analysisComplete = false;
      state.analysisStep = 0;
      state.error = null;
      state.saveSuccess = false;
      state.savedRecord = null;
      state.toast = {
        type: 'info',
        message: 'Deviation form has been reset to draft.',
      };
    },
  },
  extraReducers: (builder) => {
    // Analyze Workflow
    builder
      .addCase(analyzeDeviationThunk.pending, (state) => {
        state.analyzing = true;
        state.error = null;
        state.analysisComplete = false;
        state.analysisStep = 1;
      })
      .addCase(analyzeDeviationThunk.fulfilled, (state, action) => {
        state.analyzing = false;
        state.analysisComplete = true;
        state.analysisStep = 6;
        
        const payload = action.payload;
        const extracted = payload.data;
        
        // Auto-populate left form fields
        state.formData = {
          site: extracted.site || '',
          date_of_occurrence: extracted.date_of_occurrence || '',
          title: extracted.title || '',
          source: extracted.source || '',
          related_product: extracted.related_product || '',
          batch_lot_number: extracted.batch_lot_number || '',
          detailed_description: extracted.detailed_description || '',
          initial_impact: extracted.initial_impact || 'Product Quality',
          initial_severity: extracted.initial_severity || 'Major',
        };

        // Mark populated fields as 'ai' extracted
        Object.keys(state.fieldMeta).forEach((key) => {
          if (extracted[key]) {
            state.fieldMeta[key] = 'ai';
          }
        });

        // Store AI recommendation details
        state.aiRecommendation = {
          severity_reason: extracted.severity_reason || '',
          confidence: extracted.confidence || 0.95,
          key_findings: extracted.key_findings || [],
          immediate_actions: extracted.immediate_actions || [],
          processing_time_ms: payload.processing_time_ms || 0,
          steps_executed: payload.steps_executed || [],
        };

        state.is_demo_mode = payload.is_demo_mode;
        state.model_used = payload.model_used;
        state.rawExtractedText = payload.raw_text;

        // Post chat update from assistant
        state.chatMessages.push({
          role: 'assistant',
          content: `I have analyzed the deviation and populated the form on the left. Recommended severity is **${extracted.initial_severity}** with impact on **${extracted.initial_impact}**. Please review the populated values and adjust any fields before saving.`,
        });

        state.toast = {
          type: 'success',
          message: payload.is_demo_mode
            ? 'Deviation analyzed in Demo Mode. Form auto-populated!'
            : 'AI Extraction Complete! Form auto-populated.',
        };
      })
      .addCase(analyzeDeviationThunk.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload || 'Analysis failed';
        state.toast = {
          type: 'error',
          message: action.payload || 'Analysis failed. Please check file format or input text.',
        };
      });

    // Save Deviation
    builder
      .addCase(saveDeviationThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveDeviationThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.saveSuccess = true;
        state.savedRecord = action.payload;
        state.toast = {
          type: 'success',
          message: `Deviation #${action.payload.id} successfully saved to QMS database!`,
        };
      })
      .addCase(saveDeviationThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || 'Failed to save deviation';
        state.toast = {
          type: 'error',
          message: action.payload || 'Error saving deviation to database.',
        };
      });

    // Fetch Saved Deviations List
    builder
      .addCase(fetchDeviationsThunk.pending, (state) => {
        state.savedListLoading = true;
      })
      .addCase(fetchDeviationsThunk.fulfilled, (state, action) => {
        state.savedListLoading = false;
        state.savedList = action.payload;
      })
      .addCase(fetchDeviationsThunk.rejected, (state) => {
        state.savedListLoading = false;
      });

    // Chat
    builder
      .addCase(sendChatMessageThunk.pending, (state, action) => {
        state.chatLoading = true;
        state.chatMessages.push({
          role: 'user',
          content: action.meta.arg,
        });
      })
      .addCase(sendChatMessageThunk.fulfilled, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          role: 'assistant',
          content: action.payload.botResponse,
        });
      })
      .addCase(sendChatMessageThunk.rejected, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your question. Please try asking again.',
        });
      });
  },
});

export const {
  updateFormField,
  setPastedText,
  setUploadedFile,
  removeUploadedFile,
  setAnalysisStep,
  clearToast,
  setToast,
  setSavedModalOpen,
  resetForm,
  setActiveTab,
  setModuleCounts,
} = deviationSlice.actions;

export default deviationSlice.reducer;
