/**
 * Formulaire modal de création et de modification d'un livre.
 *
 * Fonctionnement général :
 * - Si la prop `initial` est fournie → mode édition (pré-remplissage du formulaire).
 * - Sinon → mode création (formulaire vide).
 * - `onSubmit` est une fonction asynchrone fournie par la page parente
 *   (handleCreate ou handleUpdate selon le contexte).
 *
 * Sélection des auteurs :
 * - La liste des auteurs disponibles est chargée au montage via `authorService.getAll()`.
 * - Chaque auteur est un bouton toggle : sélectionné = fond sombre, désélectionné = bordure.
 * - `toggleAuthor(id)` ajoute ou retire l'ID de la liste `authorIds`.
 *
 * Validation :
 * - Seul le titre est obligatoire (validé côté client avant envoi).
 * - Les champs optionnels vides sont envoyés comme `undefined` (pas de chaîne vide)
 *   pour que le back-end ne stocke pas de valeurs vides en BDD.
 *
 * Accessibilité (ARIA) :
 * - `role="dialog"` + `aria-modal="true"` + `aria-labelledby` → même pattern que ConfirmModal.
 * - Touche Escape → ferme le modal.
 * - `inputClass()` : fonction helper qui centralise les classes Tailwind des champs,
 *   avec variante rouge si une erreur de validation est présente.
 *
 * Animation :
 * - `animate-modal-in` (scale + fade de 180ms, défini dans index.css).
 */
import { useEffect, useRef, useState } from 'react';
import type { Author, Book, BookRequest } from '../types';
import { authorService } from '../services/authorService';

interface Props {
  initial?: Book;       // livre existant → mode édition ; absent → mode création
  onSubmit: (data: BookRequest) => Promise<void>;
  onClose: () => void;  // ferme le modal (appelé aussi après succès)
}

/** Liste fixe des genres littéraires proposés dans le select. */
const GENRES = ['Roman', 'Poésie', 'Science', 'Histoire', 'Jeunesse', 'Biographie', 'Fantastique', 'Autre'];

/**
 * Génère les classes Tailwind d'un champ de formulaire.
 * Si `error` est défini, la bordure devient rouge pour signaler l'erreur.
 */
const inputClass = (error?: string) =>
  `w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400 focus:border-stone-900 dark:focus:border-stone-400 transition-colors duration-150 ${
    error ? 'border-red-400' : 'border-stone-200 dark:border-stone-700'
  }`;

export default function BookForm({ initial, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<BookRequest>({
    title: '', isbn: '', publicationDate: '', summary: '',
    pageCount: undefined, genre: '', authorIds: [],
  });
  const [authors, setAuthors] = useState<Author[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof BookRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Chargement de la liste des auteurs disponibles pour la sélection */
  useEffect(() => { authorService.getAll().then(setAuthors).catch(() => {}); }, []);

  /* Pré-remplissage du formulaire en mode édition */
  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title, isbn: initial.isbn ?? '',
        publicationDate: initial.publicationDate ?? '',
        summary: initial.summary ?? '', pageCount: initial.pageCount,
        genre: initial.genre ?? '', authorIds: initial.authors.map(a => a.id),
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

  /**
   * Bascule la sélection d'un auteur : si l'ID est déjà dans la liste → retrait,
   * sinon → ajout. Utilise un spread immutable pour ne pas muter l'état directement.
   */
  function toggleAuthor(id: number) {
    setForm(f => ({
      ...f,
      authorIds: f.authorIds.includes(id)
        ? f.authorIds.filter(aid => aid !== id)
        : [...f.authorIds, id],
    }));
  }

  /** Validation côté client — seul le titre est requis. */
  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = 'Le titre est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Soumission du formulaire :
   * 1. Validation → arrêt si erreurs.
   * 2. Appel de `onSubmit` (create ou update selon le contexte).
   * 3. Fermeture du modal après succès.
   * Les champs optionnels vides sont normalisés en `undefined` pour le back-end.
   */
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
      {/* Backdrop — clic ferme le modal sauf pendant une soumission */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={!loading ? onClose : undefined} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-form-title"
        className="animate-modal-in relative bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="book-form-title" className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {initial ? 'Modifier le livre' : 'Nouveau livre'}
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
          {/* Titre — champ obligatoire */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Titre *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Les Misérables"
              className={inputClass(errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* ISBN + Date publication — grille 2 colonnes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">ISBN</label>
              <input
                value={form.isbn}
                onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
                placeholder="978-2-07-040850-4"
                className={inputClass()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Date de publication</label>
              <input
                type="date"
                value={form.publicationDate}
                onChange={e => setForm(f => ({ ...f, publicationDate: e.target.value }))}
                className={inputClass()}
              />
            </div>
          </div>

          {/* Genre + Nombre de pages */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Genre</label>
              <select
                value={form.genre}
                onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                className={`${inputClass()} cursor-pointer`}
              >
                <option value="">— Sélectionner —</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nombre de pages</label>
              <input
                type="number"
                min={1}
                value={form.pageCount ?? ''}
                onChange={e => setForm(f => ({ ...f, pageCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="300"
                className={inputClass()}
              />
            </div>
          </div>

          {/* Résumé */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Résumé</label>
            <textarea
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              placeholder="Résumé du livre…"
              rows={3}
              className={`${inputClass()} resize-none`}
            />
          </div>

          {/* Sélection des auteurs — liste de boutons toggle */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Auteurs
              {form.authorIds.length > 0 && (
                <span className="ml-2 text-xs text-stone-400 font-normal">
                  {form.authorIds.length} sélectionné{form.authorIds.length > 1 ? 's' : ''}
                </span>
              )}
            </label>
            {authors.length === 0 ? (
              <p className="text-sm text-stone-400">Aucun auteur disponible — créez d'abord un auteur.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border border-stone-200 dark:border-stone-700 rounded-lg p-3">
                {authors.map(author => {
                  const selected = form.authorIds.includes(author.id);
                  return (
                    <button
                      key={author.id}
                      type="button"
                      onClick={() => toggleAuthor(author.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors duration-150 cursor-pointer ${
                        selected
                          ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                          : 'border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {/* Checkbox visuelle — cochée si l'auteur est sélectionné */}
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-white dark:bg-stone-900 border-white dark:border-stone-900' : 'border-stone-300 dark:border-stone-600'}`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-stone-900 dark:text-stone-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

          {/* Boutons de soumission */}
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
