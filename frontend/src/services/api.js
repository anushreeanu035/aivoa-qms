import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 45000, // 45 seconds for document parsing and LLM calls
});

// ================= DEVIATIONS =================
export const analyzeDeviationApi = async ({ file, text }) => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (text) {
    formData.append('text', text);
  }

  const response = await client.post('/deviations/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const saveDeviationApi = async (deviationData) => {
  const response = await client.post('/deviations', deviationData);
  return response.data;
};

export const getDeviationsApi = async () => {
  const response = await client.get('/deviations');
  return response.data;
};

export const getDeviationByIdApi = async (id) => {
  const response = await client.get(`/deviations/${id}`);
  return response.data;
};

export const chatDeviationApi = async ({ message, deviationContext, rawText, history }) => {
  const response = await client.post('/deviations/chat', {
    message,
    deviation_context: deviationContext,
    raw_text: rawText,
    history: history || [],
  });
  return response.data;
};

// ================= CAPAs =================
export const getCapasApi = async (statusFilter) => {
  const params = statusFilter && statusFilter !== 'All' ? { status_filter: statusFilter } : {};
  const response = await client.get('/capas', { params });
  return response.data;
};

export const createCapaApi = async (capaData) => {
  const response = await client.post('/capas', capaData);
  return response.data;
};

export const updateCapaApi = async (id, updateData) => {
  const response = await client.put(`/capas/${id}`, updateData);
  return response.data;
};

export const deleteCapaApi = async (id) => {
  const response = await client.delete(`/capas/${id}`);
  return response.data;
};

export const createCapaFromDeviationApi = async (deviationId) => {
  const response = await client.post(`/capas/from-deviation/${deviationId}`);
  return response.data;
};

// ================= CHANGE CONTROLS =================
export const getChangeControlsApi = async (statusFilter, typeFilter) => {
  const params = {};
  if (statusFilter && statusFilter !== 'All') params.status_filter = statusFilter;
  if (typeFilter && typeFilter !== 'All') params.type_filter = typeFilter;
  const response = await client.get('/change-controls', { params });
  return response.data;
};

export const createChangeControlApi = async (ccData) => {
  const response = await client.post('/change-controls', ccData);
  return response.data;
};

export const updateChangeControlApi = async (id, updateData) => {
  const response = await client.put(`/change-controls/${id}`, updateData);
  return response.data;
};

export const deleteChangeControlApi = async (id) => {
  const response = await client.delete(`/change-controls/${id}`);
  return response.data;
};

// ================= AUDITS =================
export const getAuditsApi = async (statusFilter, typeFilter) => {
  const params = {};
  if (statusFilter && statusFilter !== 'All') params.status_filter = statusFilter;
  if (typeFilter && typeFilter !== 'All') params.type_filter = typeFilter;
  const response = await client.get('/audits', { params });
  return response.data;
};

export const createAuditApi = async (auditData) => {
  const response = await client.post('/audits', auditData);
  return response.data;
};

export const updateAuditApi = async (id, updateData) => {
  const response = await client.put(`/audits/${id}`, updateData);
  return response.data;
};

export const deleteAuditApi = async (id) => {
  const response = await client.delete(`/audits/${id}`);
  return response.data;
};

// ================= DOCUMENTS =================
export const getDocumentsApi = async ({ category, department, search } = {}) => {
  const params = {};
  if (category && category !== 'All') params.category = category;
  if (department && department !== 'All') params.department = department;
  if (search && search.trim()) params.search = search.trim();
  const response = await client.get('/documents', { params });
  return response.data;
};

export const createDocumentApi = async (docData) => {
  const response = await client.post('/documents', docData);
  return response.data;
};

export const updateDocumentApi = async (id, updateData) => {
  const response = await client.put(`/documents/${id}`, updateData);
  return response.data;
};

export const deleteDocumentApi = async (id) => {
  const response = await client.delete(`/documents/${id}`);
  return response.data;
};

// ================= REPORTS & ANALYTICS =================
export const getReportSummaryApi = async () => {
  const response = await client.get('/reports/summary');
  return response.data;
};

export const getExportCsvUrl = (moduleName) => {
  return `${API_BASE}/reports/export/${moduleName}`;
};

// ================= SYSTEM HEALTH =================
export const getHealthApi = async () => {
  const response = await client.get('/health');
  return response.data;
};
