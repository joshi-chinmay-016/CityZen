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

export interface HazardReport {
  type: string;
  severity: number;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    try {
      const response = await api.get<Report[]>('/reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      return []; // Return empty array instead of throwing to prevent UI crash
    }
  },

  createReport: async (report: HazardReport): Promise<Report> => {
    try {
      const response = await api.post<Report>('/reports', report);
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  uploadReport: async (formData: FormData): Promise<any> => {
    try {
      // Note: We're calling the ML service directly because the backend doesn't have multer
      const response = await fetch('http://localhost:8000/predict/', {
        method: 'POST',
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Error uploading to ML service:', error);
      throw error;
    }
  }
};