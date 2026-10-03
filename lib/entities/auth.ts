export type TUserRole = "OWNER" | string;

export type TUser = {
  id: string;
  fullName: string;
  email: string;
  role: TUserRole;
};

export type TLoginPayload = {
  email: string;
  password: string;
}

export type TLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: TUser;
}

export type TRefreshPayload = {
  refreshToken: string;
}

export type TRefreshResponse = {
  accessToken: string;
  refreshToken: string;
}

export type TForgotPasswordPayload = {
  email: string;
};

export type TForgotPasswordResult = {
  challengeId?: string;
};

export type TVerifyResetOtpPayload = {
  challengeId: string;
  otp: string;
};

export type TResendResetOtpPayload = {
  challengeId: string;
};

export type TResetPasswordPayload = {
  password: string;
  confirmPassword: string;
};