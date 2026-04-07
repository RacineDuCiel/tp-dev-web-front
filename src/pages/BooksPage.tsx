/**
 * Page de liste des livres — CRUD complet.
 *
 * Gestion de l'état :
 * - `books` : liste courante (complète ou résultats de recherche).
 * - `editTarget` : livre sélectionné pour édition (undefined = mode création).
 * - `deleteTarget` : livre sélectionné pour suppression (undefined = pas de modal ouvert).
 *
 * Flux CRUD :
 * - **Créer** : setEditTarget(undefined) + setShowForm(true) → BookForm en mode création.
 * - **Modifier** : setEditTarget(book) + setShowForm(true) → BookForm pré-rempli.
 * - **Supprimer** : setDeleteTarget(book) → ConfirmModal → handleDelete() → API DELETE.
 *
 * Recherche (SearchBar) :
 * - Si la query est vide → on recharge tous les livres (handleSearch → fetchBooks).
 * - Sinon → appel à bookService.search(q) → remplace la liste affichée.
 * - Le composant SearchBar gère le debounce de 350ms en interne.
 *
 * Mises à jour optimistes :
 * - Après création : ajout du livre dans l'état local sans re-fetch global.
 * - Après mise à jour : remplacement du livre modifié dans la liste.
 * - Après suppression : retrait du livre de la liste.
 * Ces trois opérations évitent un rechargement complet de la liste depuis l'API.
 *
 * `useCallback` sur `fetchBooks` et `handleSearch` stabilise les références
 * pour éviter les boucles infinies dans les dépendances des `useEffect`.
 *
 * `animate-page-in` : animation de fondu-glissement au montage (défini dans index.css).
 */
import { useCallback, useEffect, useState } from 'react';
import { bookService } from '../services/bookService';
import type { Book, BookRequest } from '../types';
import BookCard from '../components/BookCard';
import BookForm from '../components/BookForm';
import ConfirmModal from '../components/ConfirmModal';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Book | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Book | undefined>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { addToast } = useToast();

  /**
   * Charge tous les livres depuis l'API.
   * `useCallback` avec `addToast` comme dépendance — stable grâce au `useCallback` dans ToastContext.
   */
  const fetchBooks = useCallback(async () => {
    try {
      const data = await bookService.getAll();
      setBooks(data);
    } catch {
      addToast('Erreur lors du chargement des livres', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  /* Chargement initial au montage du composant */
  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  /**
   * Gestion de la recherche avec debounce (piloté par SearchBar).
   * Query vide → rechargement complet ; query non vide → recherche filtrée.
   */
  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q === '') {
      fetchBooks();
    } else {
      const results = await bookService.search(q).catch(() => []);
      setBooks(results);
    }
  }, [fetchBooks]);

  /** Création : ajoute le nouveau livre à la liste locale sans re-fetch. */
  async function handleCreate(data: BookRequest) {
    const created = await bookService.create(data);
    setBooks(prev => [...prev, created]);
    addToast(`"${created.title}" créé`);
  }

  /** Mise à jour : remplace le livre modifié dans la liste locale. */
  async function handleUpdate(data: BookRequest) {
    if (!editTarget) return;
    const updated = await bookService.update(editTarget.id, data);
    setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
    addToast(`"${updated.title}" mis à jour`);
  }

  /** Suppression : retire le livre de la liste locale après confirmation. */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await bookService.delete(deleteTarget.id);
      setBooks(prev => prev.filter(b => b.id !== deleteTarget.id));
      addToast(`"${deleteTarget.title}" supprimé`);
      setDeleteTarget(undefined);
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="animate-page-in max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* En-tête : titre + compteur + bouton Nouveau livre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Livres</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500 mt-0.5">
            {books.length} livre{books.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="px-3 py-2 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 cursor-pointer transition-colors duration-150"
        >
          Nouveau livre
        </button>
      </div>

      {/* Barre de recherche avec debounce intégré */}
      <SearchBar placeholder="Rechercher un livre…" onSearch={handleSearch} />

      {/* Grille de cartes ou état vide */}
      {books.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">
            {searchQuery ? 'Aucun résultat.' : 'Aucun livre.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => { setEditTarget(undefined); setShowForm(true); }}
              className="mt-3 px-3 py-2 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 cursor-pointer transition-colors duration-150"
            >
              Nouveau livre
            </button>
          )}
        </div>
      ) : (
        /* Grille responsive : 1 → 2 → 3 → 4 colonnes selon la largeur */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={b => { setEditTarget(b); setShowForm(true); }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modal de création/édition — rendu uniquement si showForm est vrai */}
      {showForm && (
        <BookForm
          initial={editTarget}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
      {/* Modal de confirmation de suppression */}
      {deleteTarget && (
        <ConfirmModal
          title="Supprimer le livre"
          message={`Voulez-vous vraiment supprimer "${deleteTarget.title}" ? Toutes ses illustrations seront également supprimées.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(undefined)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
