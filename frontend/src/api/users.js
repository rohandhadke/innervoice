import api from '../utils/axiosInstance';

export const getUserPosts = (username) =>
  api.get(`/api/users/${username}/posts`);

export const getSavedPosts = () =>
  api.get('/api/saved/');
