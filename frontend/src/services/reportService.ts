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

export interface CreateReportPayload {
  lat: number;
  lng: number;
  type: 'traffic' | 'pothole' | 'safety';
  latitude: number;
  longitude: number;
  hazard: string;
  severity: Report['severity'];
  confidence?: number;
  description?: string;
  timestamp?: string;
}

type RawReport = Partial<Report> & Record<string, unknown>;
type UploadReportInput = CreateReportPayload | FormData;

const normalizeSeverity = (severity: unknown): Report['severity'] => {
  const value = String(severity ?? '').toLowerCase();

  switch (value) {
    case 'low':
      return 'Low';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
    case 'medium':
    default:
      return 'Medium';
  }
};

const normalizeReport = (report: RawReport): Report => {
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);
  const confidenceValue = Number(report.confidence);
  const normalizedConfidence = Number.isFinite(confidenceValue)
    ? confidenceValue <= 1
      ? Math.round(confidenceValue * 100)
      : confidenceValue
    : 0;

  return {
    id: String(report.id ?? ''),
    latitude,
    longitude,
    hazard: String(report.hazard ?? 'unknown'),
    severity: normalizeSeverity(report.severity),
    confidence: normalizedConfidence,
    timestamp: String(report.timestamp ?? new Date().toISOString()),
  };
};

const buildPayloadFromFormData = (formData: FormData): CreateReportPayload => {
  const hazardType = String(
    formData.get('hazard') ??
      formData.get('hazardType') ??
      'pothole'
  );
  const lat = Number(formData.get('lat') ?? formData.get('latitude') ?? 12.9716);
  const lng = Number(formData.get('lng') ?? formData.get('longitude') ?? 77.5946);

  const type: CreateReportPayload['type'] =
    hazardType === 'pothole'
      ? 'pothole'
      : hazardType === 'waterlogging'
        ? 'traffic'
        : 'safety';

  return {
    lat,
    lng,
    type,
    latitude: lat,
    longitude: lng,
    hazard: hazardType,
    severity: normalizeSeverity(formData.get('severity')),
    confidence: Number(formData.get('confidence') ?? formData.get('confidenceScore') ?? 90),
    description: String(formData.get('description') ?? `${hazardType} reported by community user.`),
    timestamp: new Date().toISOString(),
  };
};

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    try {
      const response = await api.get<unknown>('/reports');
      return Array.isArray(response.data) ? response.data.map((item) => normalizeReport(item as RawReport)) : [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  uploadReport: async (reportData: UploadReportInput): Promise<Report> => {
    try {
      const payload = reportData instanceof FormData ? buildPayloadFromFormData(reportData) : reportData;
      const response = await api.post<unknown>('/reports', payload);
      const normalized = normalizeReport({
        ...payload,
        ...(typeof response.data === 'object' && response.data ? response.data as Record<string, unknown> : {}),
      });
      return normalized;
    } catch (error) {
      console.error('Error uploading report:', error);
      throw error;
    }
  },
};
