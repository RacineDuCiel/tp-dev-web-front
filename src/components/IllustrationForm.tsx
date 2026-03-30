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
    <div className="border-t border-gray-200 pt-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4">Ajouter une illustration</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Couverture originale"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150 ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optionnel"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image *</label>
          <div className="flex gap-2">
            <input
              value={form.imageUrl}
              onChange={e => { setForm(f => ({ ...f, imageUrl: e.target.value })); setPreview(false); }}
              placeholder="https://exemple.com/image.jpg"
              className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150 ${errors.imageUrl ? 'border-red-400' : 'border-gray-200'}`}
            />
            {form.imageUrl && (
              <button
                type="button"
                onClick={() => setPreview(p => !p)}
                className="px-3 py-2 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150"
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
            className="w-full max-h-40 object-contain rounded-lg border border-gray-200 bg-gray-50"
            onError={() => setPreview(false)}
          />
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-150 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
}
