import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile/me'),
  updateProfile: (data) => api.put('/users/profile/me', data),
  getPreferences: () => api.get('/users/preferences/me'),
  updatePreferences: (data) => api.put('/users/preferences/me', data),
  getMyBookings: (params) => api.get('/users/bookings/me', { params }),
  applyAsEngineer: (data) => api.post('/users/apply-engineer', data),
};

// Engineer APIs
export const engineerAPI = {
  getEngineers: (params) => api.get('/engineers', { params }),
  getFeaturedEngineers: () => api.get('/engineers/featured'),
  searchEngineers: (params) => api.get('/engineers/search', { params }),
  getEngineerById: (id) => api.get(`/engineers/${id}`),
  getEngineerDesigns: (id, params) => api.get(`/engineers/${id}/designs`, { params }),
  getEngineerReviews: (id, params) => api.get(`/engineers/${id}/reviews`, { params }),
  getEngineerStats: (id) => api.get(`/engineers/${id}/stats`),
  updateProfile: (data) => api.put('/engineers/profile', data),
  updateAvailability: (data) => api.put('/engineers/availability', data),
  addPortfolioItem: (data) => api.post('/engineers/portfolio', data),
  removePortfolioItem: (portfolioId) => api.delete(`/engineers/portfolio/${portfolioId}`),
};

// Design APIs
export const designAPI = {
  getDesigns: (params) => api.get('/designs', { params }),
  getFeaturedDesigns: () => api.get('/designs/featured'),
  getTrendingDesigns: () => api.get('/designs/trending'),
  getFilterOptions: () => api.get('/designs/filters/options'),
  getDesignById: (id) => api.get(`/designs/${id}`),
  getDesignBySlug: (slug) => api.get(`/designs/slug/${slug}`),
  createDesign: (data) => api.post('/designs', data),
  updateDesign: (id, data) => api.put(`/designs/${id}`, data),
  deleteDesign: (id) => api.delete(`/designs/${id}`),
  submitForApproval: (id) => api.post(`/designs/${id}/submit`),
  getMyDesigns: () => api.get('/designs/engineer/my-designs'),
  toggleLike: (id) => api.post(`/designs/${id}/like`),
  getRelatedDesigns: (id) => api.get(`/designs/${id}/related`),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getEngineerBookings: (params) => api.get('/bookings/engineer/my-bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  confirmBooking: (id, data) => api.post(`/bookings/${id}/confirm`, data),
  cancelBooking: (id, data) => api.post(`/bookings/${id}/cancel`, data),
  checkAvailability: (engineerId, date) => 
    api.get(`/bookings/engineer/${engineerId}/availability`, { params: { date } }),
  getStatistics: (params) => api.get('/bookings/engineer/stats', { params }),
};

// Review APIs
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getReviews: (params) => api.get('/reviews', { params }),
  getReviewById: (id) => api.get(`/reviews/${id}`),
  getEngineerReviews: (engineerId, params) => 
    api.get(`/reviews/engineer/${engineerId}`, { params }),
  getReviewStats: (engineerId) => api.get(`/reviews/stats/${engineerId}`),
  getMyReviews: (params) => api.get('/reviews/my/reviews', { params }),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  respondToReview: (id, data) => api.post(`/reviews/${id}/respond`, data),
};

// Category APIs
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getCategoryHierarchy: () => api.get('/categories/hierarchy'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  getCategoryBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Recommendation APIs
export const recommendationAPI = {
  getHomeRecommendations: () => api.get('/recommendations/home'),
  getTrendingDesigns: () => api.get('/recommendations/trending'),
  getPopularDesigns: () => api.get('/recommendations/popular'),
  getDesignRecommendations: (designId) => 
    api.get(`/recommendations/designs/${designId}`),
  getBudgetRecommendations: (params) => 
    api.get('/recommendations/budget', { params }),
  getStyleRecommendations: (style) => 
    api.get(`/recommendations/style/${style}`),
  getPersonalizedRecommendations: () => 
    api.get('/recommendations/personalized'),
  getEngineerRecommendations: () => 
    api.get('/recommendations/engineers'),
  recordInteraction: (data) => api.post('/recommendations/interact', data),
};

// Chat APIs
export const chatAPI = {
  getChats: () => api.get('/chats'),
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Upload APIs
export const uploadAPI = {
  uploadImage: (formData) => 
    api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadFile: (formData) => 
    api.post('/uploads/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getDesigns: (params) => api.get('/admin/designs', { params }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  approveDesign: (id) => api.put(`/admin/designs/${id}/approve`),
  rejectDesign: (id, reason) => api.put(`/admin/designs/${id}/reject`, { reason }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;

