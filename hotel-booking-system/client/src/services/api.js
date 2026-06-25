import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to requests if it exists in localStorage
API.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
  getUsers: () => API.get('/auth/users'),
  deleteUser: (id) => API.delete(`/auth/users/${id}`),
};

export const hotelAPI = {
  getAll: (params) => API.get('/hotels', { params }),
  getById: (id) => API.get(`/hotels/${id}`),
  create: (hotelData) => API.post('/hotels', hotelData),
  update: (id, hotelData) => API.put(`/hotels/${id}`, hotelData),
  delete: (id) => API.delete(`/hotels/${id}`),
};

export const roomAPI = {
  getAll: (params) => API.get('/rooms', { params }),
  getById: (id) => API.get(`/rooms/${id}`),
  create: (roomData) => API.post('/rooms', roomData),
  update: (id, roomData) => API.put(`/rooms/${id}`, roomData),
  delete: (id) => API.delete(`/rooms/${id}`),
};

export const bookingAPI = {
  create: (bookingData) => API.post('/bookings', bookingData),
  getMyBookings: () => API.get('/bookings/my-bookings'),
  getAll: () => API.get('/bookings'),
  cancel: (id) => API.put(`/bookings/${id}/cancel`),
  updateStatus: (id, status) => API.put(`/bookings/${id}/status`, { status }),
};

export default API;
