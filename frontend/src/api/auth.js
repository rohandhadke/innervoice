import api from '../utils/axiosInstance';

export const registerUser = (data) =>
  api.post('/api/auth/register', data);

export const loginUser = (data) =>
  api.post('/api/auth/login', data);

export const refreshToken = (token) =>
  api.post(`/api/auth/refresh?token=${token}`);

export const getMe = () =>
  api.get('/api/users/me');

export const updateMe = (data) =>
  api.put('/api/users/me', data);

export const getUserByUsername = (username) =>
  api.get(`/api/users/${username}`);

export const sendOtp = (data) =>
  api.post('/api/auth/send-otp', data);

export const verifyOtp = (data) =>
  api.post('/api/auth/verify-otp', data);
