import api from './api';
import type { Illustration, IllustrationRequest } from '../types';

export const illustrationService = {
  getAll: () => api.get<Illustration[]>('/illustrations').then(r => r.data),
  getById: (id: number) => api.get<Illustration>(`/illustrations/${id}`).then(r => r.data),
  getByBookId: (bookId: number) => api.get<Illustration[]>(`/illustrations/book/${bookId}`).then(r => r.data),
  create: (data: IllustrationRequest) => api.post<Illustration>('/illustrations', data).then(r => r.data),
  update: (id: number, data: IllustrationRequest) => api.put<Illustration>(`/illustrations/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/illustrations/${id}`),
};
