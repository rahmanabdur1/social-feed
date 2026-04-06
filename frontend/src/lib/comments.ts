import api from "./axios";

export const fetchComments = async (postId: string) => {
  const res = await api.get(`/comments/${postId}`);
  return res.data;
};

export const createComment = async (
  postId: string,
  content: string,
  parentId?: string
) => {
  const res = await api.post("/comments", {
    post_id: postId,
    content,
    parent_id: parentId || null,
  });
  return res.data;
};

export const likeComment = async (commentId: string) => {
  const res = await api.post(`/comments/${commentId}/like`);
  return res.data;
};

export const deleteComment = async (commentId: string) => {
  const res = await api.delete(`/comments/${commentId}`);
  return res.data;
};