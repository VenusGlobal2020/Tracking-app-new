import axios from 'axios';

export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: SERVER_URL + '/api',
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}
