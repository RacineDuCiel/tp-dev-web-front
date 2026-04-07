/**
 * Page de liste des auteurs — CRUD complet.
 *
 * Même architecture que `BooksPage` avec les différences suivantes :
 * - Pas d'illustrations → gestion plus simple.
 * - Recherche par prénom OU nom (côté back : OR dans la requête JPQL).
 *
 * Gestion de l'état :
 * - `authors` : liste courante (complète ou résultats de recherche).
 * - `editTarget` : auteur sélectionné pour édition (undefined = mode création).
 * - `deleteTarget` : auteur sélectionné pour suppression (undefined = pas de modal).
 *
 * Flux CRUD :
 * - **Créer** : setEditTarget(undefined) + setShowForm(true) → AuthorForm en mode création.
 * - **Modifier** : setEditTarget(author) + setShowForm(true) → AuthorForm pré-rempli.
 * - **Supprimer** : setDeleteTarget(author) → ConfirmModal → handleDelete() → API DELETE.
 *
 * Mises à jour optimistes :
 * - Création : ajout dans l'état local.
 * - Mise à jour : remplacement dans la liste.
 * - Suppression : retrait de la liste.
 * Ces trois opérations évitent un rechargement complet de la liste depuis l'API.
 *
 * `animate-page-in` : animation de fondu-glissement au montage (défini dans index.css).
 */
import { useCallback, useEffect, useState } from 'react';
import { authorService } from '../services/authorService';
import type { Author, AuthorRequest } from '../types';
import AuthorCard from '../components/AuthorCard';
import AuthorForm from '../components/AuthorForm';
import ConfirmModal from '../components/ConfirmModal';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Author | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Author | undefined>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { addToast } = useToast();

  /** Charge tous les auteurs depuis l'API. */
  const fetchAuthors = useCallback(async () => {
    try {
      const data = await authorService.getAll();
      setAuthors(data);
    } catch {
      addToast('Erreur lors du chargement des auteurs', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchAuthors(); }, [fetchAuthors]);

  /**
   * Gestion de la recherche : query vide → liste complète, sinon → recherche filtrée.
   * La SearchBar gère le debounce de 350ms avant d'appeler cette fonction.
   */
  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q === '') {
      fetchAuthors();
    } else {
      const results = await authorService.search(q).catch(() => []);
      setAuthors(results);
    }
  }, [fetchAuthors]);

  /** Création d'un auteur — mise à jour optimiste de la liste. */
  async function handleCreate(data: AuthorRequest) {
    const created = await authorService.create(data);
    setAuthors(prev => [...prev, created]);
    addToast(`"${created.firstName} ${created.lastName}" créé`);
  }

  /** Mise à jour d'un auteur — remplace l'auteur modifié dans la liste. */
  async function handleUpdate(data: AuthorRequest) {
    if (!editTarget) return;
    const updated = await authorService.update(editTarget.id, data);
    setAuthors(prev => prev.map(a => a.id === updated.id ? updated : a));
    addToast(`"${updated.firstName} ${updated.lastName}" mis à jour`);
  }

  /** Suppression d'un auteur — retire l'auteur de la liste après confirmation. */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await authorService.delete(deleteTarget.id);
      setAuthors(prev => prev.filter(a => a.id !== deleteTarget.id));
      addToast(`"${deleteTarget.firstName} ${deleteTarget.lastName}" supprimé`);
      setDeleteTarget(undefined);
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="animate-page-in max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* En-tête : titre + compteur + bouton Nouvel auteur */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Auteurs</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500 mt-0.5">
            {authors.length} auteur{authors.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="px-3 py-2 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 cursor-pointer transition-colors duration-150"
        >
          Nouvel auteur
        </button>
      </div>

      {/* Barre de recherche par prénom ou nom */}
      <SearchBar placeholder="Rechercher un auteur…" onSearch={handleSearch} />

      {/* Grille de cartes ou état vide */}
      {authors.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">
            {searchQuery ? 'Aucun résultat.' : 'Aucun auteur.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => { setEditTarget(undefined); setShowForm(true); }}
              className="mt-3 px-3 py-2 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 cursor-pointer transition-colors duration-150"
            >
              Nouvel auteur
            </button>
          )}
        </div>
      ) : (
        /* Grille responsive : 1 → 2 → 3 → 4 colonnes selon la largeur */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {authors.map(author => (
            <AuthorCard
              key={author.id}
              author={author}
              onEdit={a => { setEditTarget(a); setShowForm(true); }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modal de création/édition */}
      {showForm && (
        <AuthorForm
          initial={editTarget}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {deleteTarget && (
        <ConfirmModal
          title="Supprimer l'auteur"
          message={`Voulez-vous vraiment supprimer "${deleteTarget.firstName} ${deleteTarget.lastName}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(undefined)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
