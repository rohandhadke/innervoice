import api from '../utils/axiosInstance';

export const addReaction = (postId, reactionType) =>
  api.post(`/api/posts/${postId}/reactions/`, { reaction_type: reactionType });
