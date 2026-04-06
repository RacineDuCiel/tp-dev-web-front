/**
 * Service d'accès aux données des auteurs.
 *
 * Même pattern que `bookService` : chaque méthode retourne une Promise
 * du type métier (Author ou Author[]) sans exposer la structure Axios.
 * Le token JWT Keycloak est automatiquement injecté par l'intercepteur
 * défini dans `api.ts`.
 *
 * Routes utilisées (base : http://localhost:8080/api) :
 *   GET    /authors                → liste tous les auteurs
 *   GET    /authors/:id            → détail d'un auteur (avec bookCount)
 *   GET    /authors/search?q=      → recherche par prénom ou nom (insensible à la casse)
 *   POST   /authors                → création d'un auteur
 *   PUT    /authors/:id            → mise à jour complète d'un auteur
 *   DELETE /authors/:id            → suppression de l'auteur (retire de ses livres d'abord)
 */
import api from './api';
import type { Author, AuthorRequest } from '../types';

export const authorService = {
  /** Retourne tous les auteurs avec leur nombre de livres (`bookCount`). */
  getAll: () => api.get<Author[]>('/authors').then(r => r.data),

  /** Retourne un auteur par son ID. Lance une erreur Axios si 404. */
  getById: (id: number) => api.get<Author>(`/authors/${id}`).then(r => r.data),

  /**
   * Recherche des auteurs dont le prénom OU le nom contient `q`.
   * `encodeURIComponent` est indispensable pour les noms accentués (ex. : "Éluard").
   */
  search: (q: string) => api.get<Author[]>(`/authors/search?q=${encodeURIComponent(q)}`).then(r => r.data),

  /** Crée un auteur. Renvoie l'auteur créé avec son `id` généré. */
  create: (data: AuthorRequest) => api.post<Author>('/authors', data).then(r => r.data),

  /** Met à jour un auteur existant (PUT = remplacement complet). */
  update: (id: number, data: AuthorRequest) => api.put<Author>(`/authors/${id}`, data).then(r => r.data),

  /**
   * Supprime un auteur.
   * Côté back-end, le service retire d'abord l'auteur de tous ses livres
   * (synchronisation de la table de jointure ManyToMany) avant la suppression.
   */
  delete: (id: number) => api.delete(`/authors/${id}`),
};
