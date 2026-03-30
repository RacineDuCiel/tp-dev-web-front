import { useEffect, useState } from 'react';
import type { Author, Book, BookRequest } from '../types';
import { authorService } from '../services/authorService';

interface Props {
  initial?: Book;
  onSubmit: (data: BookRequest) => Promise<void>;
  onClose: () => void;
}

const GENRES = ['Roman', 'Poésie', 'Science', 'Histoire', 'Jeunesse', 'Biographie', 'Fantastique', 'Autre'];

export default function BookForm({ initial, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<BookRequest>({
    title: '',
    isbn: '',
    publicationDate: '',
    summary: '',
    pageCount: undefined,
    genre: '',
    authorIds: [],
  });
  const [authors, setAuthors] = useState<Author[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof BookRequest, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authorService.getAll().then(setAuthors).catch(() => {});
  }, []);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        isbn: initial.isbn ?? '',
        publicationDate: initial.publicationDate ?? '',
        summary: initial.summary ?? '',
        pageCount: initial.pageCount,
        genre: initial.genre ?? '',
        authorIds: initial.authors.map(a => a.id),
      });
    }
  }, [initial]);

  function toggleAuthor(id: number) {
    setForm(f => ({
      ...f,
      authorIds: f.authorIds.includes(id)
        ? f.authorIds.filter(aid => aid !== id)
        : [...f.authorIds, id],
    }));
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = 'Le titre est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        isbn: form.isbn || undefined,
        publicationDate: form.publicationDate || undefined,
        summary: form.summary || undefined,
        genre: form.genre || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {initial ? 'Modifier le livre' : 'Nouveau livre'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Les Misérables"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150 ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input
                value={form.isbn}
                onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
                placeholder="978-2-07-040850-4"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de publication</label>
              <input
                type="date"
                value={form.publicationDate}
                onChange={e => setForm(f => ({ ...f, publicationDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select
                value={form.genre}
                onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150 bg-white"
              >
                <option value="">— Sélectionner —</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de pages</label>
              <input
                type="number"
                min={1}
                value={form.pageCount ?? ''}
                onChange={e => setForm(f => ({ ...f, pageCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="300"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Résumé</label>
            <textarea
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              placeholder="Résumé du livre…"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auteurs
              {form.authorIds.length > 0 && (
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  {form.authorIds.length} sélectionné{form.authorIds.length > 1 ? 's' : ''}
                </span>
              )}
            </label>
            {authors.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun auteur disponible — créez d'abord un auteur.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {authors.map(author => {
                  const selected = form.authorIds.includes(author.id);
                  return (
                    <button
                      key={author.id}
                      type="button"
                      onClick={() => toggleAuthor(author.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors duration-150 ${
                        selected
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-white border-white' : 'border-gray-300'}`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {author.firstName} {author.lastName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-150 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {initial ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
