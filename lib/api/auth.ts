import api, { API_URL } from "./client";

export async function sendVerifyEmailRequest(address: string) {
  return api.post(`${API_URL}/auth/verify-email`, { email: address });
}

export async function sendVerifyOtpRequest(email: string, otp: string) {
  return api.post(`${API_URL}/auth/verify-otp`, { otp, email });
}

export async function sendRegisterRequest(profile: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  activity: string;
  [key: string]: unknown;
}) {
  const { firstName, lastName, email, phone, activity, ...rest } = profile;
  return api.post(`${API_URL}/auth/register`, {
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    activity,
    info_business: rest,
  });
}

export async function checkLoginCode(email: string, code: string) {
  return api.post(`${API_URL}/auth/verify-login`, { email, otp: code });
}

export async function sendAuthRequest(email: string) {
  return api.post(`${API_URL}/auth/login`, { email });
}

export async function fetchBackupSecret() {
  return api.get(`${API_URL}/backup-key`);
}
