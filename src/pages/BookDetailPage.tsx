import { useEffect, useState } from 'react';
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

  async function loadBook() {
    if (!id) return;
    try {
      const data = await bookService.getById(Number(id));
      setBook(data);
    } catch {
      navigate('/books');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBook(); }, [id]);

  async function handleUpdate(data: BookRequest) {
    if (!book) return;
    const updated = await bookService.update(book.id, data);
    setBook(updated);
    addToast(`Livre "${updated.title}" mis à jour`);
  }

  async function handleDeleteBook() {
    if (!book) return;
    setDeleteBookLoading(true);
    try {
      await bookService.delete(book.id);
      addToast(`Livre "${book.title}" supprimé`);
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
    await loadBook(); // Recharger le livre pour avoir la nouvelle illustration
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/books" className="hover:text-indigo-600 transition-colors">Livres</Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium line-clamp-1">{book.title}</span>
      </nav>

      {/* Fiche livre */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {book.genre && (
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {book.genre}
                  </span>
                )}
                {book.isbn && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">
                    ISBN: {book.isbn}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>

              {book.publicationDate && (
                <p className="mt-1 text-sm text-gray-500">
                  Publié le {new Date(book.publicationDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}

              {book.pageCount && (
                <p className="text-sm text-gray-400">{book.pageCount} pages</p>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteBook(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            </div>
          </div>

          {book.summary && (
            <p className="mt-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-5">
              {book.summary}
            </p>
          )}

          {/* Auteurs */}
          {book.authors.length > 0 && (
            <div className="mt-5 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Auteurs</h3>
              <div className="flex flex-wrap gap-2">
                {book.authors.map(author => (
                  <Link
                    key={author.id}
                    to={`/authors/${author.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {author.firstName[0]}
                    </div>
                    {author.firstName} {author.lastName}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Galerie des illustrations */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Illustrations
          <span className="ml-2 text-sm font-normal text-gray-400">({book.illustrations.length})</span>
        </h2>

        {book.illustrations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {book.illustrations.map(illus => (
              <div key={illus.id} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="aspect-video bg-gray-50">
                  <img
                    src={illus.imageUrl}
                    alt={illus.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).className = 'hidden';
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{illus.title}</p>
                      {illus.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{illus.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setDeleteIllus(illus)}
                      className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer l'illustration"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire d'ajout d'illustration */}
        <IllustrationForm bookId={book.id} onSubmit={handleAddIllustration} />
      </section>

      {/* Modals */}
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
