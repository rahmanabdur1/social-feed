import api from "./axios";

export const fetchPosts = async (cursor?: string, limit = 10) => {
  const res = await api.get("/posts", {
    params: { cursor, limit },
  });
  return res.data;
};

export const createPost = async (
  content: string,
  isPrivate: boolean,
  image?: File
) => {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("is_private", String(isPrivate));
  if (image) formData.append("image", image);
  const res = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deletePost = async (postId: string) => {
  const res = await api.delete(`/posts/${postId}`);
  return res.data;
};

export const likePost = async (postId: string) => {
  const res = await api.post(`/posts/${postId}/like`);
  return res.data;
};

export const getPostLikes = async (postId: string) => {
  const res = await api.get(`/posts/${postId}/likes`);
  return res.data;
};