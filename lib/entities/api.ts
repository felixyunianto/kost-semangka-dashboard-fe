
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TError = any

export type TErrorCode =
  | "SUCCESS"
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_ERROR";

export type ErrorResponse = {
  code: TErrorCode;
  data: null;
  message: string;
  serverTime?: string | number;
  status?: number;
  errors?: TError;
};

export type ErrorResponseWithData<T> = {
  code: TErrorCode;
  data: T;
  message: string;
  serverTime?: string | number;
  status?: number;
  errors?: TError;
};

export type SuccessResponse<T> = {
  code: 'SUCCESS';
  message: string;
  data: T;
  serverTime: string | number;
  errors?: TError;
};


export type TApiResponse<T> =
  | SuccessResponse<T>
  | ErrorResponse
  | ErrorResponseWithData<T>;