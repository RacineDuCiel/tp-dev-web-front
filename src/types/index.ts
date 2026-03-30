// ─── Réponses du back-end ────────────────────────────────────────────────────

export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  bio?: string;
  birthDate?: string;
  nationality?: string;
  bookCount: number;
}

export interface AuthorSummary {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Illustration {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  bookId: number;
  bookTitle: string;
}

export interface Book {
  id: number;
  title: string;
  isbn?: string;
  publicationDate?: string;
  summary?: string;
  pageCount?: number;
  genre?: string;
  authors: AuthorSummary[];
  illustrations: Illustration[];
}

// ─── Requêtes vers le back-end ───────────────────────────────────────────────

export interface AuthorRequest {
  firstName: string;
  lastName: string;
  bio?: string;
  birthDate?: string;
  nationality?: string;
}

export interface BookRequest {
  title: string;
  isbn?: string;
  publicationDate?: string;
  summary?: string;
  pageCount?: number;
  genre?: string;
  authorIds: number[];
}

export interface IllustrationRequest {
  title: string;
  description?: string;
  imageUrl: string;
  bookId: number;
}
