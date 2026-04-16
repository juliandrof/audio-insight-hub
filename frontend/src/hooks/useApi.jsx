import { useState, useCallback } from 'react';

const BASE = '/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API Error');
  }
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/pdf')) {
    return res.blob();
  }
  return res.json();
}

export function useApi() {
  // Dashboard
  const fetchStats = () => apiFetch('/dashboard/stats');

  // Categories
  const fetchCategories = () => apiFetch('/categories');
  const createCategory = (data) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) });
  const updateCategory = (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  const deleteCategory = (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' });

  // Audio upload
  const uploadAudio = (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE}/audio/upload`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            reject(new Error(JSON.parse(xhr.responseText).detail));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  };

  // Volume processing
  const processVolume = (volumePath) =>
    apiFetch(`/audio/process-volume?volume_path=${encodeURIComponent(volumePath)}`, { method: 'POST' });

  // Analyses
  const fetchAnalyses = (params = {}) => {
    const qs = new URLSearchParams();
    if (params.category_id) qs.set('category_id', params.category_id);
    if (params.sentiment) qs.set('sentiment', params.sentiment);
    if (params.search) qs.set('search', params.search);
    if (params.limit) qs.set('limit', params.limit);
    if (params.offset) qs.set('offset', params.offset);
    return apiFetch(`/analyses?${qs.toString()}`);
  };
  const fetchAnalysis = (id) => apiFetch(`/analyses/${id}`);
  const deleteAnalysis = (id) => apiFetch(`/analyses/${id}`, { method: 'DELETE' });

  // PDF Export
  const exportPdf = (id) => apiFetch(`/export/pdf/${id}`);
  const exportAllPdf = () => apiFetch('/export/pdf/all');
  const exportBatchPdf = (ids) => apiFetch('/export/pdf/batch', { method: 'POST', body: JSON.stringify(ids) });

  // Settings
  const fetchSettings = () => apiFetch('/settings');
  const updateSetting = (key, value) => apiFetch('/settings', { method: 'PUT', body: JSON.stringify({ key, value }) });

  return {
    fetchStats, fetchCategories, createCategory, updateCategory, deleteCategory,
    uploadAudio, processVolume,
    fetchAnalyses, fetchAnalysis, deleteAnalysis,
    exportPdf, exportAllPdf, exportBatchPdf,
    fetchSettings, updateSetting,
  };
}
