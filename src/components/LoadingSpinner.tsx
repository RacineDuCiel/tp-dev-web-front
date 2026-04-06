/**
 * Indicateur de chargement réutilisable.
 *
 * Deux modes d'affichage selon la prop `fullPage` :
 * - `fullPage = false` (défaut) : le spinner seul, utilisable inline dans un composant.
 * - `fullPage = true` : le spinner centré dans un conteneur qui occupe au moins 60% de
 *   la hauteur de la vue (`min-h-[60vh]`), utilisé sur les pages qui chargent des données.
 *
 * Le spinner est une `div` avec `border-t-amber-700` (couleur reliure bibliothèque)
 * tournant via `animate-spin` (Tailwind). La bordure partielle crée l'effet de rotation.
 */
export default function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  const spinner = (
    <div className="w-5 h-5 border-2 border-stone-200 dark:border-stone-700 border-t-amber-700 dark:border-t-amber-500 rounded-full animate-spin" />
  );

  if (fullPage) {
    return (
      // Fond adapté au thème (stone-50 en clair, stone-950 en sombre)
      <div className="min-h-[60vh] flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        {spinner}
      </div>
    );
  }

  return spinner;
}
