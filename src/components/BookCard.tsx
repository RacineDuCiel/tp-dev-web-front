import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';

interface Props {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export default function BookCard({ book, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const cover = book.illustrations[0]?.imageUrl;

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150 cursor-pointer group flex flex-col overflow-hidden"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
          {book.title}
        </h3>

        {book.authors.length > 0 && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-1">
            {book.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
          </p>
        )}

        {book.genre && (
          <p className="mt-1 text-xs text-gray-400">{book.genre}</p>
        )}

        {(onEdit || onDelete) && (
          <div
            className="mt-auto pt-3 flex justify-end gap-1"
            onClick={e => e.stopPropagation()}
          >
            {onEdit && (
              <button
                onClick={() => onEdit(book)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                title="Modifier"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(book)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                title="Supprimer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
