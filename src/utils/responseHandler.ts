import { ApiResponse } from "../types/api.type";

export const createResponse = <T>(
  success: boolean,
  data?: T,
  error?: { message: string; details?: any }
): ApiResponse<T> => {
  return { success, data, error };
};
