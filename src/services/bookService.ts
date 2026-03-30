import api from './api';
import type { Book, BookRequest } from '../types';

export const bookService = {
  getAll: () => api.get<Book[]>('/books').then(r => r.data),
  getById: (id: number) => api.get<Book>(`/books/${id}`).then(r => r.data),
  search: (q: string) => api.get<Book[]>(`/books/search?q=${encodeURIComponent(q)}`).then(r => r.data),
  create: (data: BookRequest) => api.post<Book>('/books', data).then(r => r.data),
  update: (id: number, data: BookRequest) => api.put<Book>(`/books/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/books/${id}`),
};
