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

  async function fetchBooks() {
    try {
      const data = await bookService.getAll();
      setBooks(data);
    } catch {
      addToast('Erreur lors du chargement des livres', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBooks(); }, []);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q === '') {
      fetchBooks();
    } else {
      const results = await bookService.search(q).catch(() => []);
      setBooks(results);
    }
  }, []);

  async function handleCreate(data: BookRequest) {
    const created = await bookService.create(data);
    setBooks(prev => [...prev, created]);
    addToast(`Livre "${created.title}" créé`);
  }

  async function handleUpdate(data: BookRequest) {
    if (!editTarget) return;
    const updated = await bookService.update(editTarget.id, data);
    setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
    addToast(`Livre "${updated.title}" mis à jour`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await bookService.delete(deleteTarget.id);
      setBooks(prev => prev.filter(b => b.id !== deleteTarget.id));
      addToast(`Livre "${deleteTarget.title}" supprimé`);
      setDeleteTarget(undefined);
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livres</h1>
          <p className="text-sm text-gray-500 mt-0.5">{books.length} livre{books.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un livre
        </button>
      </div>

      {/* Barre de recherche */}
      <SearchBar placeholder="Rechercher un livre par titre…" onSearch={handleSearch} />

      {/* Grille */}
      {books.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="font-medium">{searchQuery ? 'Aucun résultat' : 'Aucun livre pour l\'instant'}</p>
          {!searchQuery && <p className="text-sm mt-1">Ajoutez votre premier livre !</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

      {/* Modals */}
      {showForm && (
        <BookForm
          initial={editTarget}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
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
