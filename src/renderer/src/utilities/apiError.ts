export type ApiErrorLike = {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      title?: string;
    };
  };
  message?: string;
};

export const asApiError = (error: unknown): ApiErrorLike => error as ApiErrorLike;
