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

  async function fetchAuthors() {
    try {
      const data = await authorService.getAll();
      setAuthors(data);
    } catch {
      addToast('Erreur lors du chargement des auteurs', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAuthors(); }, []);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q === '') {
      fetchAuthors();
    } else {
      const results = await authorService.search(q).catch(() => []);
      setAuthors(results);
    }
  }, []);

  async function handleCreate(data: AuthorRequest) {
    const created = await authorService.create(data);
    setAuthors(prev => [...prev, created]);
    addToast(`Auteur "${created.firstName} ${created.lastName}" créé`);
  }

  async function handleUpdate(data: AuthorRequest) {
    if (!editTarget) return;
    const updated = await authorService.update(editTarget.id, data);
    setAuthors(prev => prev.map(a => a.id === updated.id ? updated : a));
    addToast(`Auteur "${updated.firstName} ${updated.lastName}" mis à jour`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await authorService.delete(deleteTarget.id);
      setAuthors(prev => prev.filter(a => a.id !== deleteTarget.id));
      addToast(`Auteur "${deleteTarget.firstName} ${deleteTarget.lastName}" supprimé`);
      setDeleteTarget(undefined);
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auteurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{authors.length} auteur{authors.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un auteur
        </button>
      </div>

      {/* Barre de recherche */}
      <SearchBar placeholder="Rechercher un auteur par prénom ou nom…" onSearch={handleSearch} />

      {/* Grille */}
      {authors.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-medium">{searchQuery ? 'Aucun résultat' : 'Aucun auteur pour l\'instant'}</p>
          {!searchQuery && <p className="text-sm mt-1">Ajoutez votre premier auteur !</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Formulaire modal */}
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
