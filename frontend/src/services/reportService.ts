import api from './api';

export interface Report {
  id: string;
  latitude: number;
  longitude: number;
  hazard: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  timestamp: string;
}

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    try {
      const response = await api.get<Report[]>('/reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  uploadReport: async (reportData: FormData): Promise<Report> => {
    try {
      const response = await api.post<Report>('/reports/upload', reportData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading report:', error);
      throw error;
    }
  },
};