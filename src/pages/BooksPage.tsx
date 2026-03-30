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

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q === '') {
      fetchBooks();
    } else {
      const results = await bookService.search(q).catch(() => []);
      setBooks(results);
    }
  }, [fetchBooks]);

  async function handleCreate(data: BookRequest) {
    const created = await bookService.create(data);
    setBooks(prev => [...prev, created]);
    addToast(`"${created.title}" créé`);
  }

  async function handleUpdate(data: BookRequest) {
    if (!editTarget) return;
    const updated = await bookService.update(editTarget.id, data);
    setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
    addToast(`"${updated.title}" mis à jour`);
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Livres</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {books.length} livre{books.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-150"
        >
          Nouveau livre
        </button>
      </div>

      <SearchBar placeholder="Rechercher un livre…" onSearch={handleSearch} />

      {books.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Aucun résultat.' : 'Aucun livre.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => { setEditTarget(undefined); setShowForm(true); }}
              className="mt-3 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-150"
            >
              Nouveau livre
            </button>
          )}
        </div>
      ) : (
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
