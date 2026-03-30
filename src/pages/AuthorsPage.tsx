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

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q === '') {
      fetchAuthors();
    } else {
      const results = await authorService.search(q).catch(() => []);
      setAuthors(results);
    }
  }, [fetchAuthors]);

  async function handleCreate(data: AuthorRequest) {
    const created = await authorService.create(data);
    setAuthors(prev => [...prev, created]);
    addToast(`"${created.firstName} ${created.lastName}" créé`);
  }

  async function handleUpdate(data: AuthorRequest) {
    if (!editTarget) return;
    const updated = await authorService.update(editTarget.id, data);
    setAuthors(prev => prev.map(a => a.id === updated.id ? updated : a));
    addToast(`"${updated.firstName} ${updated.lastName}" mis à jour`);
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Auteurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {authors.length} auteur{authors.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-150"
        >
          Nouvel auteur
        </button>
      </div>

      <SearchBar placeholder="Rechercher un auteur…" onSearch={handleSearch} />

      {authors.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Aucun résultat.' : 'Aucun auteur.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => { setEditTarget(undefined); setShowForm(true); }}
              className="mt-3 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-150"
            >
              Nouvel auteur
            </button>
          )}
        </div>
      ) : (
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

      {showForm && (
        <AuthorForm
          initial={editTarget}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

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
