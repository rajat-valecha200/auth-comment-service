import api from "./axios"

export const authAPI = {
  signup: (userData) => api.post("/auth/signup", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) => api.post("/auth/reset-password", { token, newPassword }),
  refreshToken: (refreshToken) => api.post("/auth/refresh-token", { refreshToken }),
}

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  getAllUsers: () => api.get("/users/all"),
  updateUserPermissions: (userId, permissions) => api.put(`/users/${userId}/permissions`, permissions),
}

export const commentAPI = {
  getAllComments: () => api.get("/comments"),
  createComment: (content) => api.post("/comments", { content }),
  updateComment: (commentId, content) => api.put(`/comments/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
}
