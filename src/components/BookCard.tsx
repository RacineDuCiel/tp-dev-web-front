import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';

interface Props {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

const GENRE_COLORS: Record<string, string> = {
  Roman: 'bg-indigo-100 text-indigo-700',
  Poésie: 'bg-purple-100 text-purple-700',
  Science: 'bg-blue-100 text-blue-700',
  Histoire: 'bg-amber-100 text-amber-700',
  Jeunesse: 'bg-green-100 text-green-700',
  Biographie: 'bg-orange-100 text-orange-700',
  Fantastique: 'bg-pink-100 text-pink-700',
};

function genreClass(genre?: string) {
  if (!genre) return 'bg-gray-100 text-gray-600';
  return GENRE_COLORS[genre] ?? 'bg-gray-100 text-gray-600';
}

export default function BookCard({ book, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const cover = book.illustrations[0]?.imageUrl;

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden border border-gray-100 flex flex-col"
    >
      {/* Couverture ou placeholder */}
      <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-indigo-200">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs font-medium text-indigo-300">Pas d'illustration</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {book.genre && (
          <span className={`self-start text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 ${genreClass(book.genre)}`}>
            {book.genre}
          </span>
        )}

        <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
          {book.title}
        </h3>

        {book.authors.length > 0 && (
          <p className="mt-1.5 text-sm text-gray-500">
            {book.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {book.pageCount && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {book.pageCount} p.
              </span>
            )}
            {book.illustrations.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {book.illustrations.length}
              </span>
            )}
          </div>

          {(onEdit || onDelete) && (
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              {onEdit && (
                <button
                  onClick={() => onEdit(book)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Modifier"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(book)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
