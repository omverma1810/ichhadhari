import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

interface RequestConfig extends AxiosRequestConfig<unknown> {
  skipAuthRefresh?: boolean;
}

class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    const configuredBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://ichhadhari-backend-162541991773.asia-south1.run.app";

    // Ensure baseURL ends with /api for all API calls
    const baseUrl = configuredBaseUrl.replace(/\/+$/, "");
    const apiBaseUrl = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;

    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - attach JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === "development") {
          const logDetails = {
            params: config.params,
            data: config.data,
          } satisfies Record<string, unknown>;
          console.log(
            `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
            Object.fromEntries(
              Object.entries(logDetails).filter(([, value]) => value != null)
            )
          );
        }

        return config;
      },
      (error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[API Request Error]", error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh on 401
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (process.env.NODE_ENV === "development") {
          const responseLog = {
            status: response.status,
            data: response.data,
          } satisfies Record<string, unknown>;
          console.log(
            `[API Response] ${response.config.method?.toUpperCase()} ${
              response.config.url
            }`,
            Object.fromEntries(
              Object.entries(responseLog).filter(([, value]) => value != null)
            )
          );
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestConfig;
        const status = error.response?.status;
        const method = originalRequest?.method?.toUpperCase();
        const shouldSuppressLog =
          method === "GET" && (status === 404 || status === 204);

        if (process.env.NODE_ENV === "development" && !shouldSuppressLog) {
          const errorDetails = {
            url: originalRequest?.url,
            method,
            status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            code: error.code,
            message: error.message,
          } satisfies Record<string, unknown>;

          const filteredDetails = Object.fromEntries(
            Object.entries(errorDetails).filter(
              ([, value]) => value !== undefined && value !== null
            )
          );

          const fallbackDetails =
            typeof error.toJSON === "function"
              ? error.toJSON()
              : {
                  message: error.message,
                  stack: error.stack,
                };

          console.error(
            "[API Response Error]",
            Object.keys(filteredDetails).length > 0
              ? filteredDetails
              : fallbackDetails
          );
        }

        // Handle 401 errors - token refresh
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest.skipAuthRefresh
        ) {
          if (this.isRefreshing) {
            // Queue the request while refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            // Attempt to refresh token - use full URL for auth endpoints
            const API_BASE_URL =
              process.env.NEXT_PUBLIC_API_URL ||
              "https://ichhadhari-backend-162541991773.asia-south1.run.app";
            const response = await axios.post(
              `${API_BASE_URL}/api/auth/token/refresh/`,
              { refresh: refreshToken }
            );

            const { access } = response.data;
            this.setAccessToken(access);

            // Retry all queued requests
            this.failedQueue.forEach((promise) => promise.resolve());
            this.failedQueue = [];

            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            this.failedQueue.forEach((promise) => promise.reject(refreshError));
            this.failedQueue = [];
            this.clearTokens();

            // Redirect to login
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  private setAccessToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  private clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    }
  }

  public async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig<never>
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig<TData>
  ): Promise<TResponse> {
    const response: AxiosResponse<TResponse> =
      await this.client.post<TResponse>(url, data, config);
    return response.data;
  }

  public async put<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig<TData>
  ): Promise<TResponse> {
    const response: AxiosResponse<TResponse> = await this.client.put<TResponse>(
      url,
      data,
      config
    );
    return response.data;
  }

  public async patch<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig<TData>
  ): Promise<TResponse> {
    const response: AxiosResponse<TResponse> =
      await this.client.patch<TResponse>(url, data, config);
    return response.data;
  }

  public async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig<never>
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export default for backward compatibility
export default apiClient;

// Utility types
export type ApiErrorResponse = {
  message?: unknown;
  error?: unknown;
  detail?: unknown;
  non_field_errors?: unknown;
  [key: string]: unknown;
};

export type ApiError = {
  response?: {
    data?: ApiErrorResponse | string;
  };
  message?: string;
};

const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred";

const parseErrorPayload = (
  payload: ApiErrorResponse | string | undefined
): string | undefined => {
  if (!payload) return undefined;

  if (typeof payload === "string") {
    return payload;
  }

  if (
    typeof payload.message === "string" &&
    payload.message.trim().length > 0
  ) {
    return payload.message;
  }

  if (typeof payload.error === "string" && payload.error.trim().length > 0) {
    return payload.error;
  }

  if (typeof payload.detail === "string" && payload.detail.trim().length > 0) {
    return payload.detail;
  }

  if (
    Array.isArray(payload.non_field_errors) &&
    payload.non_field_errors.length > 0
  ) {
    const first = payload.non_field_errors[0];
    if (typeof first === "string") {
      return first;
    }
  }

  const firstValue = Object.values(payload)[0];
  if (Array.isArray(firstValue) && firstValue.length > 0) {
    const candidate = firstValue[0];
    if (typeof candidate === "string") {
      return candidate;
    }
  }

  return undefined;
};

const getErrorMessage = (error: unknown): string => {
  if (!error) return DEFAULT_ERROR_MESSAGE;

  if (axios.isAxiosError(error)) {
    const payloadMessage = parseErrorPayload(
      error.response?.data as ApiErrorResponse | string
    );
    if (payloadMessage) return payloadMessage;
    if (typeof error.message === "string" && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (typeof error === "object" && error !== null) {
    const maybeApiError = error as ApiError;
    const payloadMessage = parseErrorPayload(maybeApiError.response?.data);
    if (payloadMessage) return payloadMessage;
    if (
      typeof maybeApiError.message === "string" &&
      maybeApiError.message.trim().length > 0
    ) {
      return maybeApiError.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return DEFAULT_ERROR_MESSAGE;
};

export const handleApiError = (error: unknown): string => {
  const message = getErrorMessage(error);
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", message, error);
  }
  return message;
};
