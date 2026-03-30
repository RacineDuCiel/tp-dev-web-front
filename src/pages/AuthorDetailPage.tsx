import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authorService } from '../services/authorService';
import { bookService } from '../services/bookService';
import type { Author, Book, AuthorRequest } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthorForm from '../components/AuthorForm';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      authorService.getById(Number(id)),
      bookService.getAll(),
    ])
      .then(([a, allBooks]) => {
        setAuthor(a);
        // Filtrer les livres dont la liste d'auteurs contient cet auteur
        setBooks(allBooks.filter(b => b.authors.some(au => au.id === Number(id))));
      })
      .catch(() => navigate('/authors'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(data: AuthorRequest) {
    if (!author) return;
    const updated = await authorService.update(author.id, data);
    setAuthor(updated);
    addToast(`Auteur "${updated.firstName} ${updated.lastName}" mis à jour`);
  }

  async function handleDelete() {
    if (!author) return;
    setDeleteLoading(true);
    try {
      await authorService.delete(author.id);
      addToast(`Auteur "${author.firstName} ${author.lastName}" supprimé`);
      navigate('/authors');
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;
  if (!author) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/authors" className="hover:text-indigo-600 transition-colors">Auteurs</Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{author.firstName} {author.lastName}</span>
      </nav>

      {/* Carte profil */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl shrink-0">
              {author.firstName[0]}{author.lastName[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{author.firstName} {author.lastName}</h1>
                <div className="flex gap-2">
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
                    onClick={() => setShowDelete(true)}
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

              <div className="mt-3 flex flex-wrap gap-3">
                {author.nationality && (
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                    🌍 {author.nationality}
                  </span>
                )}
                {author.birthDate && (
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                    📅 {new Date(author.birthDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
                <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 font-medium">
                  📚 {author.bookCount} livre{author.bookCount !== 1 ? 's' : ''}
                </span>
              </div>

              {author.bio && (
                <p className="mt-4 text-gray-600 leading-relaxed">{author.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Livres de l'auteur */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Livres de cet auteur
          <span className="ml-2 text-sm font-normal text-gray-400">({books.length})</span>
        </h2>

        {books.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="font-medium">Aucun livre associé à cet auteur</p>
            <Link to="/books" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
              Aller dans les livres pour en créer un
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {books.map(book => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 group"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {book.title}
                </h3>
                {book.genre && (
                  <span className="mt-2 inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {book.genre}
                  </span>
                )}
                {book.publicationDate && (
                  <p className="mt-2 text-xs text-gray-400">{new Date(book.publicationDate).getFullYear()}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {showEdit && (
        <AuthorForm initial={author} onSubmit={handleUpdate} onClose={() => setShowEdit(false)} />
      )}
      {showDelete && (
        <ConfirmModal
          title="Supprimer l'auteur"
          message={`Voulez-vous vraiment supprimer "${author.firstName} ${author.lastName}" ?`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
