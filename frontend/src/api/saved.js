import api from '../utils/axiosInstance';

export const savePost = (postId) =>
  api.post(`/api/saved/${postId}`);

export const getSavedPosts = () =>
  api.get('/api/saved/');

export const unsavePost = (postId) =>
  api.delete(`/api/saved/${postId}`);
