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
      className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150 cursor-pointer group p-5 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm shrink-0">
          {author.firstName[0]}{author.lastName[0]}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            {onEdit && (
              <button
                onClick={() => onEdit(author)}
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
                onClick={() => onDelete(author)}
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

      <h3 className="font-medium text-gray-900 text-sm">
        {author.firstName} {author.lastName}
      </h3>

      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
        {author.nationality && <span>{author.nationality}</span>}
        {author.nationality && <span className="text-gray-300">·</span>}
        <span>{author.bookCount} livre{author.bookCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
