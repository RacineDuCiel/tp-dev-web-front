import api from './api';
import type { Author, AuthorRequest } from '../types';

export const authorService = {
  getAll: () => api.get<Author[]>('/authors').then(r => r.data),
  getById: (id: number) => api.get<Author>(`/authors/${id}`).then(r => r.data),
  search: (q: string) => api.get<Author[]>(`/authors/search?q=${encodeURIComponent(q)}`).then(r => r.data),
  create: (data: AuthorRequest) => api.post<Author>('/authors', data).then(r => r.data),
  update: (id: number, data: AuthorRequest) => api.put<Author>(`/authors/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/authors/${id}`),
};
