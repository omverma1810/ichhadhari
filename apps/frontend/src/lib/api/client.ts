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
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    this.client = axios.create({
      baseURL: configuredBaseUrl.replace(/\/+$/, ""),
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
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
  [key: string]: unknown;
};

export type ApiError = {
  response?: {
    data?: ApiErrorResponse;
  };
};

const getErrorMessage = (error: ApiError): string => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
    if (typeof data.detail === "string") return data.detail;
  }
  return "An unexpected error occurred";
};

export const handleApiError = (error: ApiError): void => {
  const message = getErrorMessage(error);
  console.error("API Error:", message);
  throw new Error(message);
};
