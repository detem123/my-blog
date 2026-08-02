import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

// 请求拦截器 — 自动附加 JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截器 — 统一错误处理
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      const { status, data } = err.response;
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // 避免在登录页重复跳转
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
      } else if (status === 403) {
        console.error('权限不足，请检查是否登录');
      }
    } else if (err.code === 'ECONNABORTED') {
      console.error('请求超时，后端可能未启动');
    } else if (!err.response) {
      console.error('网络错误，无法连接到后端服务器');
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (data: { username: string; password: string }) => api.post('/auth/login', data),
  register: (data: { username: string; password: string; email: string }) =>
    api.post('/auth/register', data),
};

// Article API
export const articleAPI = {
  getList: (params?: Record<string, any>) => api.get('/articles', { params }),
  getBySlug: (slug: string) => api.get(`/articles/${slug}`),
  create: (data: any) => api.post('/admin/articles', data),
  update: (id: number, data: any) => api.put(`/admin/articles/${id}`, data),
  delete: (id: number) => api.delete(`/admin/articles/${id}`),
  getMyList: (params?: Record<string, any>) => api.get('/admin/articles', { params }),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data: { name: string; description?: string }) => api.post('/categories', data),
};

// Tag API
export const tagAPI = {
  getAll: () => api.get('/tags'),
  create: (data: { name: string }) => api.post('/tags', data),
};

// Comment API
export const commentAPI = {
  getList: (articleId: number) => api.get(`/articles/${articleId}/comments`),
  create: (articleId: number, data: { content: string; parentId?: number }) =>
    api.post(`/articles/${articleId}/comments`, data),
};
