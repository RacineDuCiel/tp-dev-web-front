import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { authorService } from '../services/authorService';
import type { Book, Author } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import BookCard from '../components/BookCard';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* Bannière de bienvenue */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-lg">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenue dans la Bibliothèque</h1>
          <p className="mt-2 text-indigo-100 text-base">
            Gérez votre collection de livres, d'auteurs et d'illustrations depuis une interface unifiée.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/books')}
              className="px-5 py-2.5 bg-white text-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Voir les livres
            </button>
            <button
              onClick={() => navigate('/authors')}
              className="px-5 py-2.5 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-colors"
            >
              Voir les auteurs
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: 'Livres',
            value: books.length,
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            ),
            color: 'text-indigo-600 bg-indigo-50',
            link: '/books',
          },
          {
            label: 'Auteurs',
            value: authors.length,
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            ),
            color: 'text-purple-600 bg-purple-50',
            link: '/authors',
          },
          {
            label: 'Illustrations',
            value: books.reduce((sum, b) => sum + b.illustrations.length, 0),
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            ),
            color: 'text-emerald-600 bg-emerald-50',
            link: '/books',
          },
        ].map(stat => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.link)}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{stat.icon}</svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Derniers livres ajoutés */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Derniers livres ajoutés</h2>
          <button
            onClick={() => navigate('/books')}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
          >
            Voir tout
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {recentBooks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="font-medium">Aucun livre pour l'instant</p>
            <p className="text-sm mt-1">Commencez par ajouter votre premier livre !</p>
            <button
              onClick={() => navigate('/books')}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Ajouter un livre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {recentBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
