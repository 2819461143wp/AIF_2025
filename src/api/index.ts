import axios from 'axios';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api', // 后端 API 的基础路径
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 token 等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 在这里处理错误
    return Promise.reject(error);
  }
);

export default apiClient;