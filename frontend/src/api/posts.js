import api from '../utils/axiosInstance';

export const createPost = (data) =>
  api.post('/api/posts/', data);

export const getPosts = (params = {}) =>
  api.get('/api/posts/', { params });

export const getPost = (postId) =>
  api.get(`/api/posts/${postId}`);

export const updatePost = (postId, data) =>
  api.put(`/api/posts/${postId}`, data);

export const deletePost = (postId) =>
  api.delete(`/api/posts/${postId}`);
