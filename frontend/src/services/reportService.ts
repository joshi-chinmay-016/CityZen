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

export interface ReportInput {
  type: string;
  severity: number | string;
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

  createReport: async (reportData: ReportInput): Promise<Report> => {
    try {
      const formData = new FormData();
      formData.append('type', reportData.type);
      formData.append('severity', String(reportData.severity));
      formData.append('description', reportData.description);
      formData.append('latitude', String(reportData.latitude));
      formData.append('longitude', String(reportData.longitude));
      if (reportData.imageUrl) {
        formData.append('imageUrl', reportData.imageUrl);
      }

      const response = await api.post<Report>('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },
};