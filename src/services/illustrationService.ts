/**
 * Service d'accès aux données des illustrations.
 *
 * Les illustrations sont toujours liées à un livre (`bookId` obligatoire).
 * Ce service expose une méthode `getByBookId` qui correspond à l'endpoint
 * spécialisé `/api/illustrations/book/{bookId}`, pratique pour charger
 * les illustrations d'un livre sans refaire un GET complet du livre.
 *
 * Routes utilisées (base : http://localhost:8080/api) :
 *   GET    /illustrations                    → toutes les illustrations
 *   GET    /illustrations/:id                → une illustration par ID
 *   GET    /illustrations/book/:bookId       → illustrations d'un livre donné
 *   POST   /illustrations                    → ajout d'une illustration à un livre
 *   PUT    /illustrations/:id                → mise à jour (peut changer le livre parent)
 *   DELETE /illustrations/:id                → suppression d'une illustration
 */
import api from './api';
import type { Illustration, IllustrationRequest } from '../types';

export const illustrationService = {
  /** Retourne toutes les illustrations (tous livres confondus). */
  getAll: () => api.get<Illustration[]>('/illustrations').then(r => r.data),

  /** Retourne une illustration par son ID. */
  getById: (id: number) => api.get<Illustration>(`/illustrations/${id}`).then(r => r.data),

  /**
   * Retourne toutes les illustrations d'un livre donné.
   * Le back-end vérifie que le livre existe et renvoie HTTP 404 si ce n'est pas le cas.
   */
  getByBookId: (bookId: number) => api.get<Illustration[]>(`/illustrations/book/${bookId}`).then(r => r.data),

  /**
   * Crée une illustration et la rattache au livre indiqué par `data.bookId`.
   * Côté back-end, la relation OneToMany est synchronisée via `book.addIllustration()`.
   */
  create: (data: IllustrationRequest) => api.post<Illustration>('/illustrations', data).then(r => r.data),

  /**
   * Met à jour une illustration.
   * Si `data.bookId` diffère du livre actuel, le back-end déplace l'illustration
   * vers le nouveau livre (removeIllustration → addIllustration).
   */
  update: (id: number, data: IllustrationRequest) => api.put<Illustration>(`/illustrations/${id}`, data).then(r => r.data),

  /** Supprime une illustration. Renvoie HTTP 204. */
  delete: (id: number) => api.delete(`/illustrations/${id}`),
};
