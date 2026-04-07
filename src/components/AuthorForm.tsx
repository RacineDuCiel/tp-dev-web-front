/**
 * Formulaire modal de création et de modification d'un auteur.
 *
 * Même pattern que `BookForm` :
 * - `initial` fourni → mode édition (pré-remplissage des champs).
 * - `initial` absent → mode création (formulaire vide).
 * - Validation côté client : prénom et nom sont obligatoires.
 * - Les champs optionnels vides (bio, birthDate, nationality) sont normalisés
 *   en `undefined` avant envoi pour ne pas stocker de chaînes vides en BDD.
 *
 * Accessibilité :
 * - `role="dialog"` + `aria-modal="true"` + `aria-labelledby="author-form-title"`.
 * - Touche Escape pour fermer (géré via `useEffect` + `document.addEventListener`).
 * - `inputClass()` helper pour centraliser les classes Tailwind des champs de saisie.
 *
 * Animation : `animate-modal-in` (scale + fade de 180ms, défini dans index.css).
 */
import { useEffect, useRef, useState } from 'react';
import type { Author, AuthorRequest } from '../types';

interface Props {
  initial?: Author;     // auteur existant → mode édition ; absent → mode création
  onSubmit: (data: AuthorRequest) => Promise<void>;
  onClose: () => void;
}

/**
 * Génère les classes Tailwind d'un champ de formulaire.
 * Bordure rouge si `error` est défini, grise sinon.
 */
const inputClass = (error?: string) =>
  `w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400 focus:border-stone-900 dark:focus:border-stone-400 transition-colors duration-150 ${
    error ? 'border-red-400' : 'border-stone-200 dark:border-stone-700'
  }`;

export default function AuthorForm({ initial, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<AuthorRequest>({
    firstName: '', lastName: '', bio: '', birthDate: '', nationality: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AuthorRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Pré-remplissage du formulaire en mode édition */
  useEffect(() => {
    if (initial) {
      setForm({
        firstName: initial.firstName, lastName: initial.lastName,
        bio: initial.bio ?? '', birthDate: initial.birthDate ?? '',
        nationality: initial.nationality ?? '',
      });
    }
  }, [initial]);

  /* Escape pour fermer — ignoré si une requête est en cours */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [loading, onClose]);

  /** Validation côté client : prénom et nom sont obligatoires. */
  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Le prénom est obligatoire';
    if (!form.lastName.trim()) newErrors.lastName = 'Le nom est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Soumission du formulaire :
   * Les champs optionnels vides sont normalisés en `undefined`
   * pour éviter de stocker des chaînes vides dans la BDD.
   */
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
      {/* Backdrop semi-transparent — clic ferme le modal */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={!loading ? onClose : undefined} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="author-form-title"
        className="animate-modal-in relative bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 shadow-lg w-full max-w-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="author-form-title" className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {initial ? "Modifier l'auteur" : 'Nouvel auteur'}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prénom + Nom — champs obligatoires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Prénom *</label>
              <input
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="Victor"
                className={inputClass(errors.firstName)}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nom *</label>
              <input
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder="Hugo"
                className={inputClass(errors.lastName)}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          {/* Nationalité + Date de naissance — champs optionnels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nationalité</label>
              <input
                value={form.nationality}
                onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
                placeholder="Française"
                className={inputClass()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Date de naissance</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                className={inputClass()}
              />
            </div>
          </div>

          {/* Biographie — champ texte libre optionnel */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Biographie</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Quelques mots sur l'auteur…"
              rows={3}
              className={`${inputClass()} resize-none`}
            />
          </div>

          {/* Boutons Annuler / Créer ou Enregistrer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 flex items-center gap-2"
            >
              {/* Spinner inline pendant la soumission */}
              {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {initial ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
