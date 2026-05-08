/*
SHARED MODULE: Report Service
*/

import api from './api';
import type { Report } from '../types';

export type CreateReportPayload = {
  lat: number;
  lng: number;
  type: Report['type'];
};

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    const response = await api.get('/reports');
    return response.data;
  },

  createReport: async (data: CreateReportPayload): Promise<{ id: string }> => {
    const response = await api.post('/reports/report', data);
    return response.data;
  },
};
