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
        setBooks(allBooks.filter(b => b.authors.some(au => au.id === Number(id))));
      })
      .catch(() => navigate('/authors'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleUpdate(data: AuthorRequest) {
    if (!author) return;
    const updated = await authorService.update(author.id, data);
    setAuthor(updated);
    addToast(`"${updated.firstName} ${updated.lastName}" mis à jour`);
  }

  async function handleDelete() {
    if (!author) return;
    setDeleteLoading(true);
    try {
      await authorService.delete(author.id);
      addToast(`"${author.firstName} ${author.lastName}" supprimé`);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/authors" className="hover:text-gray-900 transition-colors duration-150">Auteurs</Link>
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900">{author.firstName} {author.lastName}</span>
      </nav>

      {/* Fiche auteur */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-base shrink-0">
              {author.firstName[0]}{author.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {author.firstName} {author.lastName}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {author.bookCount} livre{author.bookCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              Modifier
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Métadonnées */}
        <dl className="mt-4 flex flex-wrap gap-6">
          {author.nationality && (
            <div>
              <dt className="text-xs text-gray-400">Nationalité</dt>
              <dd className="mt-0.5 text-sm text-gray-900">{author.nationality}</dd>
            </div>
          )}
          {author.birthDate && (
            <div>
              <dt className="text-xs text-gray-400">Naissance</dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {new Date(author.birthDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </dd>
            </div>
          )}
        </dl>

        {author.bio && (
          <p className="mt-5 pt-5 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
            {author.bio}
          </p>
        )}
      </div>

      {/* Livres */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Livres</h2>
          <span className="text-sm text-gray-500">{books.length}</span>
        </div>

        {books.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">Aucun livre associé à cet auteur.</p>
            <Link
              to="/books"
              className="mt-2 inline-block text-sm text-gray-900 underline underline-offset-2 hover:no-underline transition-all"
            >
              Aller dans les livres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(book => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors duration-150"
              >
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{book.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  {book.genre && <span>{book.genre}</span>}
                  {book.genre && book.publicationDate && <span className="text-gray-300">·</span>}
                  {book.publicationDate && (
                    <span>{new Date(book.publicationDate).getFullYear()}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

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
