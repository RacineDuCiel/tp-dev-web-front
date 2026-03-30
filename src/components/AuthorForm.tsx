import { useEffect, useState } from 'react';
import type { Author, AuthorRequest } from '../types';

interface Props {
  initial?: Author;
  onSubmit: (data: AuthorRequest) => Promise<void>;
  onClose: () => void;
}

export default function AuthorForm({ initial, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<AuthorRequest>({
    firstName: '',
    lastName: '',
    bio: '',
    birthDate: '',
    nationality: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AuthorRequest, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        firstName: initial.firstName,
        lastName: initial.lastName,
        bio: initial.bio ?? '',
        birthDate: initial.birthDate ?? '',
        nationality: initial.nationality ?? '',
      });
    }
  }, [initial]);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Le prénom est obligatoire';
    if (!form.lastName.trim()) newErrors.lastName = 'Le nom est obligatoire';
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
        birthDate: form.birthDate || undefined,
        bio: form.bio || undefined,
        nationality: form.nationality || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {initial ? "Modifier l'auteur" : 'Nouvel auteur'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="Victor"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150 ${errors.firstName ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder="Hugo"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150 ${errors.lastName ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
              <input
                value={form.nationality}
                onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
                placeholder="Française"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Quelques mots sur l'auteur…"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150 resize-none"
            />
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
