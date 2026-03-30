import {useCallback, useEffect, useState} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { illustrationService } from '../services/illustrationService';
import type { Book, BookRequest, IllustrationRequest, Illustration } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import BookForm from '../components/BookForm';
import IllustrationForm from '../components/IllustrationForm';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteBook, setShowDeleteBook] = useState(false);
  const [deleteBookLoading, setDeleteBookLoading] = useState(false);
  const [deleteIllus, setDeleteIllus] = useState<Illustration | undefined>();
  const [deleteIllusLoading, setDeleteIllusLoading] = useState(false);

  const loadBook = useCallback(async () => {
    if (!id) return;
    try {
      const data = await bookService.getById(Number(id));
      setBook(data);
    } catch {
      navigate('/books');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadBook(); }, [loadBook]);

  async function handleUpdate(data: BookRequest) {
    if (!book) return;
    const updated = await bookService.update(book.id, data);
    setBook(updated);
    addToast(`"${updated.title}" mis à jour`);
  }

  async function handleDeleteBook() {
    if (!book) return;
    setDeleteBookLoading(true);
    try {
      await bookService.delete(book.id);
      addToast(`"${book.title}" supprimé`);
      navigate('/books');
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteBookLoading(false);
    }
  }

  async function handleAddIllustration(data: IllustrationRequest) {
    await illustrationService.create(data);
    addToast('Illustration ajoutée');
    await loadBook();
  }

  async function handleDeleteIllustration() {
    if (!deleteIllus) return;
    setDeleteIllusLoading(true);
    try {
      await illustrationService.delete(deleteIllus.id);
      setBook(prev => prev ? { ...prev, illustrations: prev.illustrations.filter(i => i.id !== deleteIllus.id) } : prev);
      addToast('Illustration supprimée');
      setDeleteIllus(undefined);
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteIllusLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;
  if (!book) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/books" className="hover:text-gray-900 transition-colors duration-150">Livres</Link>
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 truncate">{book.title}</span>
      </nav>

      {/* Fiche livre */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900">{book.title}</h1>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              Modifier
            </button>
            <button
              onClick={() => setShowDeleteBook(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Métadonnées */}
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {book.isbn && (
            <div>
              <dt className="text-xs text-gray-400">ISBN</dt>
              <dd className="mt-0.5 text-sm text-gray-900">{book.isbn}</dd>
            </div>
          )}
          {book.publicationDate && (
            <div>
              <dt className="text-xs text-gray-400">Publication</dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {new Date(book.publicationDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
              </dd>
            </div>
          )}
          {book.pageCount && (
            <div>
              <dt className="text-xs text-gray-400">Pages</dt>
              <dd className="mt-0.5 text-sm text-gray-900">{book.pageCount}</dd>
            </div>
          )}
          {book.genre && (
            <div>
              <dt className="text-xs text-gray-400">Genre</dt>
              <dd className="mt-0.5 text-sm text-gray-900">{book.genre}</dd>
            </div>
          )}
        </dl>

        {/* Auteurs */}
        {book.authors.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Auteurs</p>
            <div className="flex flex-wrap gap-2">
              {book.authors.map(author => (
                <Link
                  key={author.id}
                  to={`/authors/${author.id}`}
                  className="text-sm text-gray-700 hover:text-gray-900 hover:underline underline-offset-2 transition-colors duration-150"
                >
                  {author.firstName} {author.lastName}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Résumé */}
        {book.summary && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">{book.summary}</p>
          </div>
        )}
      </div>

      {/* Illustrations */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Illustrations</h2>
          <span className="text-sm text-gray-500">{book.illustrations.length}</span>
        </div>

        {book.illustrations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {book.illustrations.map(illus => (
              <div
                key={illus.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150"
              >
                <div className="aspect-video bg-gray-100">
                  <img
                    src={illus.imageUrl}
                    alt={illus.title}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).className = 'hidden';
                    }}
                  />
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{illus.title}</p>
                    {illus.description && (
                      <p className="text-xs text-gray-500 truncate">{illus.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteIllus(illus)}
                    className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                    title="Supprimer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <IllustrationForm bookId={book.id} onSubmit={handleAddIllustration} />
      </section>

      {showEdit && (
        <BookForm initial={book} onSubmit={handleUpdate} onClose={() => setShowEdit(false)} />
      )}
      {showDeleteBook && (
        <ConfirmModal
          title="Supprimer le livre"
          message={`Voulez-vous vraiment supprimer "${book.title}" ? Toutes ses illustrations seront également supprimées.`}
          onConfirm={handleDeleteBook}
          onCancel={() => setShowDeleteBook(false)}
          loading={deleteBookLoading}
        />
      )}
      {deleteIllus && (
        <ConfirmModal
          title="Supprimer l'illustration"
          message={`Voulez-vous supprimer l'illustration "${deleteIllus.title}" ?`}
          onConfirm={handleDeleteIllustration}
          onCancel={() => setDeleteIllus(undefined)}
          loading={deleteIllusLoading}
        />
      )}
    </div>
  );
}
