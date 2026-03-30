import { useState } from 'react';
import type { IllustrationRequest } from '../types';

interface Props {
  bookId: number;
  onSubmit: (data: IllustrationRequest) => Promise<void>;
}

export default function IllustrationForm({ bookId, onSubmit }: Props) {
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '' });
  const [errors, setErrors] = useState<{ title?: string; imageUrl?: string }>({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = 'Le titre est obligatoire';
    if (!form.imageUrl.trim()) newErrors.imageUrl = "L'URL de l'image est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: form.title,
        description: form.description || undefined,
        imageUrl: form.imageUrl,
        bookId,
      });
      setForm({ title: '', description: '', imageUrl: '' });
      setPreview(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-5 space-y-4">
      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Ajouter une illustration
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Titre *</label>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Couverture originale"
            className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <input
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Optionnel"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">URL de l'image *</label>
        <div className="flex gap-2">
          <input
            value={form.imageUrl}
            onChange={e => { setForm(f => ({ ...f, imageUrl: e.target.value })); setPreview(false); }}
            placeholder="https://exemple.com/image.jpg"
            className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.imageUrl ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
          />
          {form.imageUrl && (
            <button
              type="button"
              onClick={() => setPreview(p => !p)}
              className="px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              {preview ? 'Masquer' : 'Aperçu'}
            </button>
          )}
        </div>
        {errors.imageUrl && <p className="mt-1 text-xs text-red-500">{errors.imageUrl}</p>}
      </div>

      {preview && form.imageUrl && (
        <img
          src={form.imageUrl}
          alt="Aperçu"
          className="w-full max-h-40 object-contain rounded-xl border border-gray-200 bg-white"
          onError={() => setPreview(false)}
        />
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Ajouter
        </button>
      </div>
    </form>
  );
}
