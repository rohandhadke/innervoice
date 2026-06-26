import api from '../utils/axiosInstance';

export const addComment = (postId, data) =>
  api.post(`/api/posts/${postId}/comments/`, data);

export const getComments = (postId) =>
  api.get(`/api/posts/${postId}/comments/`);

export const getReplies = (postId, commentId) =>
  api.get(`/api/posts/${postId}/comments/${commentId}/replies`);
