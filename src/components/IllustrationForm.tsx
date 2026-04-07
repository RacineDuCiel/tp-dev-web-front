/**
 * Formulaire d'ajout d'une illustration à un livre (affiché sur la page détail d'un livre).
 *
 * Contrairement à BookForm et AuthorForm, ce formulaire n'est pas un modal :
 * il est intégré directement dans la page, en bas de la section "Illustrations".
 *
 * Fonctionnement :
 * - `bookId` est passé en prop et injecté dans le DTO avant envoi.
 * - Validation : titre et URL de l'image sont obligatoires.
 * - Prévisualisation : un bouton "Aperçu" permet d'afficher l'image avant de soumettre.
 *   Si l'image ne se charge pas (URL invalide), la prévisualisation est masquée.
 * - Après une soumission réussie, le formulaire est réinitialisé pour permettre
 *   l'ajout d'une autre illustration sans recharger la page.
 *
 * `inputClass()` : helper Tailwind centralisé (bordure rouge si erreur).
 */
import { useState } from 'react';
import type { IllustrationRequest } from '../types';

interface Props {
  bookId: number;  // ID du livre auquel rattacher l'illustration (injecté dans le DTO)
  onSubmit: (data: IllustrationRequest) => Promise<void>;
}

/**
 * Génère les classes Tailwind d'un champ de formulaire.
 * Bordure rouge si `error` est défini, grise sinon.
 */
const inputClass = (error?: string) =>
  `w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400 focus:border-stone-900 dark:focus:border-stone-400 transition-colors duration-150 ${
    error ? 'border-red-400' : 'border-stone-200 dark:border-stone-700'
  }`;

export default function IllustrationForm({ bookId, onSubmit }: Props) {
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '' });
  const [errors, setErrors] = useState<{ title?: string; imageUrl?: string }>({});
  const [loading, setLoading] = useState(false);
  /** `preview` contrôle l'affichage de la prévisualisation de l'image. */
  const [preview, setPreview] = useState(false);

  /** Validation : titre et URL obligatoires. */
  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = 'Le titre est obligatoire';
    if (!form.imageUrl.trim()) newErrors.imageUrl = "L'URL de l'image est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Soumission : envoie le DTO à la page parente (BookDetailPage.handleAddIllustration).
   * Après succès, réinitialise le formulaire pour permettre un nouvel ajout immédiat.
   * `description` vide est envoyé comme `undefined` pour le back-end.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ title: form.title, description: form.description || undefined, imageUrl: form.imageUrl, bookId });
      // Réinitialisation après succès
      setForm({ title: '', description: '', imageUrl: '' });
      setPreview(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-stone-200 dark:border-stone-700 pt-6">
      <h4 className="text-sm font-medium text-stone-900 dark:text-stone-50 mb-4">Ajouter une illustration</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titre + Description — grille 2 colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Titre *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Couverture originale"
              className={inputClass(errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description</label>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optionnel"
              className={inputClass()}
            />
          </div>
        </div>

        {/* URL de l'image avec bouton de prévisualisation */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">URL de l'image *</label>
          <div className="flex gap-2">
            <input
              value={form.imageUrl}
              onChange={e => { setForm(f => ({ ...f, imageUrl: e.target.value })); setPreview(false); }}
              placeholder="https://exemple.com/image.jpg"
              className={inputClass(errors.imageUrl)}
            />
            {/* Bouton Aperçu — visible uniquement si une URL est saisie */}
            {form.imageUrl && (
              <button
                type="button"
                onClick={() => setPreview(p => !p)}
                className="px-3 py-2 text-xs font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-150 cursor-pointer shrink-0"
              >
                {preview ? 'Masquer' : 'Aperçu'}
              </button>
            )}
          </div>
          {errors.imageUrl && <p className="mt-1 text-xs text-red-500">{errors.imageUrl}</p>}
        </div>

        {/* Prévisualisation de l'image — masquée si l'URL est invalide (onError) */}
        {preview && form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Aperçu"
            className="w-full max-h-40 object-contain rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
            onError={() => setPreview(false)}
          />
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 flex items-center gap-2"
          >
            {/* Spinner inline pendant la soumission */}
            {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
}
