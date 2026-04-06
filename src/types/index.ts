// ─── Réponses du back-end ────────────────────────────────────────────────────
// Ces interfaces reflètent exactement la structure JSON renvoyée par l'API Spring Boot.
// On travaille avec ces types dans toute la couche front-end pour bénéficier du
// typage TypeScript et éviter les erreurs de runtime.

/**
 * Auteur complet — renvoyé par GET /api/authors et GET /api/authors/{id}.
 * `bookCount` est calculé côté back-end (taille de la collection JPA) et non stocké en BDD.
 */
export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  bio?: string;          // optionnel : absent du JSON si null en BDD
  birthDate?: string;    // format ISO 8601 : "YYYY-MM-DD"
  nationality?: string;
  bookCount: number;     // nombre de livres associés, calculé par AuthorService.toResponse()
}

/**
 * Résumé d'auteur embarqué dans la réponse d'un livre.
 * On utilise un sous-type allégé (sans bio, bookCount, etc.) pour éviter la récursion
 * infinie qu'on aurait si BookResponse contenait des AuthorResponse qui contiendraient
 * des BookResponse, etc.
 */
export interface AuthorSummary {
  id: number;
  firstName: string;
  lastName: string;
}

/**
 * Illustration — renvoyée par GET /api/illustrations et imbriquée dans BookResponse.
 * `bookId` et `bookTitle` permettent d'identifier le livre sans appel supplémentaire.
 */
export interface Illustration {
  id: number;
  title: string;
  description?: string;  // optionnel
  imageUrl: string;      // URL absolue vers l'image (ex. : https://...)
  bookId: number;        // clé étrangère vers le livre parent
  bookTitle: string;     // dénormalisé dans la réponse pour l'affichage
}

/**
 * Livre complet — renvoyé par GET /api/books et GET /api/books/{id}.
 * Contient les auteurs sous forme de AuthorSummary[] (relation ManyToMany côté Book)
 * et les illustrations sous forme de Illustration[] (relation OneToMany).
 */
export interface Book {
  id: number;
  title: string;
  isbn?: string;               // optionnel — identifiant international du livre
  publicationDate?: string;    // format ISO 8601 : "YYYY-MM-DD"
  summary?: string;            // résumé textuel
  pageCount?: number;          // nombre de pages (entier positif)
  genre?: string;              // catégorie littéraire (Roman, Poésie, Science…)
  authors: AuthorSummary[];    // liste des auteurs (vide si aucun)
  illustrations: Illustration[]; // liste des illustrations (vide si aucune)
}

// ─── Requêtes vers le back-end ───────────────────────────────────────────────
// Ces interfaces définissent la structure du corps JSON envoyé dans les POST/PUT.
// Elles correspondent exactement aux DTO @RequestBody côté Spring Boot.

/**
 * Corps d'une requête de création/mise à jour d'auteur.
 * Seuls firstName et lastName sont obligatoires (validés par @NotBlank côté back-end).
 */
export interface AuthorRequest {
  firstName: string;
  lastName: string;
  bio?: string;
  birthDate?: string;    // format "YYYY-MM-DD"
  nationality?: string;
}

/**
 * Corps d'une requête de création/mise à jour d'un livre.
 * Seul `title` est obligatoire. `authorIds` est la liste des IDs des auteurs à associer
 * (peut être vide — on crée d'abord les auteurs puis on les lie au livre).
 */
export interface BookRequest {
  title: string;
  isbn?: string;
  publicationDate?: string;  // format "YYYY-MM-DD"
  summary?: string;
  pageCount?: number;
  genre?: string;
  authorIds: number[];       // IDs des auteurs à associer (relation ManyToMany)
}

/**
 * Corps d'une requête de création/mise à jour d'illustration.
 * `bookId` est obligatoire : une illustration ne peut pas exister sans livre parent.
 */
export interface IllustrationRequest {
  title: string;
  description?: string;
  imageUrl: string;    // URL de l'image (validée @NotBlank côté back-end)
  bookId: number;      // ID du livre auquel rattacher cette illustration
}
