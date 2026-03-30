import { useNavigate } from 'react-router-dom';
import type { Author } from '../types';

interface Props {
  author: Author;
  onEdit?: (author: Author) => void;
  onDelete?: (author: Author) => void;
}

export default function AuthorCard({ author, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/authors/${author.id}`)}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden border border-gray-100"
    >
      {/* En-tête coloré */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

      <div className="p-6">
        {/* Avatar avec initiales */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
            {author.firstName[0]}{author.lastName[0]}
          </div>
          {author.nationality && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
              {author.nationality}
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
          {author.firstName} {author.lastName}
        </h3>

        {author.bio && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{author.bio}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {author.bookCount} livre{author.bookCount !== 1 ? 's' : ''}
          </div>

          {(onEdit || onDelete) && (
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              {onEdit && (
                <button
                  onClick={() => onEdit(author)}
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
                  onClick={() => onDelete(author)}
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
