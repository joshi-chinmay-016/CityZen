import api from "./api";
import type { HazardReport, HazardType } from "../types/report";

export type CreateReportPayload = {
  latitude: number;
  longitude: number;
  hazard: HazardType;
};

export const reportService = {
  getReports: async (): Promise<HazardReport[]> => {
    const response = await api.get("/reports");
    return response.data;
  },

  createReport: async (
    data: CreateReportPayload
  ): Promise<{ id: string }> => {
    const response = await api.post("/reports/report", data);
    return response.data;
  },
};