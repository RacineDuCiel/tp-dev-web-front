import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { authorService } from '../services/authorService';
import type { Book, Author } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([bookService.getAll(), authorService.getAll()])
      .then(([b, a]) => { setBooks(b); setAuthors(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const recentBooks = [...books].reverse().slice(0, 5);
  const illustrationCount = books.reduce((sum, b) => sum + b.illustrations.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Livres', value: books.length, href: '/books' },
          { label: 'Auteurs', value: authors.length, href: '/authors' },
          { label: 'Illustrations', value: illustrationCount, href: '/books' },
        ].map(stat => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.href)}
            className="bg-white border border-gray-200 rounded-lg p-5 text-left hover:border-gray-300 transition-colors duration-150"
          >
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="mt-0.5 text-sm text-gray-500">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Ajouts récents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Ajouts récents</h2>
          <Link
            to="/books"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150"
          >
            Voir tout
          </Link>
        </div>

        {recentBooks.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500">Aucun livre pour l'instant.</p>
            <Link
              to="/books"
              className="mt-2 inline-block text-sm text-gray-900 underline underline-offset-2 hover:no-underline transition-all"
            >
              Ajouter un livre
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {recentBooks.map(book => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-150 group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                  {book.authors.length > 0 && (
                    <p className="text-xs text-gray-500 truncate">
                      {book.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                    </p>
                  )}
                </div>
                {book.genre && (
                  <span className="ml-4 shrink-0 text-xs text-gray-400">{book.genre}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
