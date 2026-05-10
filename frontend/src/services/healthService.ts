import api from './api';

/**
 * Service to check the health status of the backend API.
 */
export const healthService = {
  /**
   * Pings the /reports endpoint to verify if the backend is reachable.
   * @returns Promise<boolean> - True if the backend is healthy, false otherwise.
   */
  checkBackendHealth: async (): Promise<boolean> => {
    try {
      // We use /reports as a representative endpoint for health checks
      await api.get('/reports');
      console.log('[Health Check] Backend is reachable and healthy.');
      return true;
    } catch (error) {
      console.error('[Health Check] Backend is unreachable or returned an error.');
      return false;
    }
  },
};
