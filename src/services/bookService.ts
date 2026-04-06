/**
 * Service d'accès aux données des livres.
 *
 * Chaque méthode encapsule un appel à l'instance Axios `api` (qui gère
 * automatiquement l'injection du token Keycloak via son intercepteur).
 * On extrait directement `r.data` pour ne pas exposer la structure Axios
 * aux composants React — ils reçoivent uniquement les types métier définis
 * dans `types/index.ts`.
 *
 * Routes utilisées (base : http://localhost:8080/api) :
 *   GET    /books            → liste tous les livres
 *   GET    /books/:id        → détail d'un livre avec auteurs et illustrations
 *   GET    /books/search?q=  → recherche par titre (insensible à la casse)
 *   POST   /books            → création d'un livre
 *   PUT    /books/:id        → mise à jour complète d'un livre
 *   DELETE /books/:id        → suppression du livre et de ses illustrations (cascade JPA)
 */
import api from './api';
import type { Book, BookRequest } from '../types';

export const bookService = {
  /** Retourne tous les livres (avec leurs auteurs et illustrations imbriqués). */
  getAll: () => api.get<Book[]>('/books').then(r => r.data),

  /** Retourne un livre par son ID. Lance une erreur Axios si 404. */
  getById: (id: number) => api.get<Book>(`/books/${id}`).then(r => r.data),

  /**
   * Recherche des livres dont le titre contient `q` (insensible à la casse).
   * `encodeURIComponent` encode les caractères spéciaux pour l'URL (ex. : espaces → %20).
   */
  search: (q: string) => api.get<Book[]>(`/books/search?q=${encodeURIComponent(q)}`).then(r => r.data),

  /** Crée un livre. Renvoie le livre créé avec son `id` généré par la BDD. */
  create: (data: BookRequest) => api.post<Book>('/books', data).then(r => r.data),

  /** Met à jour un livre existant (PUT = remplacement complet, pas partiel). */
  update: (id: number, data: BookRequest) => api.put<Book>(`/books/${id}`, data).then(r => r.data),

  /** Supprime un livre (et ses illustrations par cascade JPA). Renvoie HTTP 204. */
  delete: (id: number) => api.delete(`/books/${id}`),
};
