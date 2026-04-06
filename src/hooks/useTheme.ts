import { useEffect, useState } from 'react';

/**
 * Hook personnalisé de gestion du thème clair/sombre.
 *
 * Fonctionnement :
 * 1. **Initialisation** : on lit `localStorage` pour retrouver le dernier choix de l'utilisateur.
 *    Si aucune préférence n'est sauvegardée, on lit `prefers-color-scheme` du navigateur
 *    pour respecter la préférence système de l'OS.
 *
 * 2. **Application** : à chaque changement de `dark`, on ajoute/retire la classe `"dark"`
 *    sur `<html>`. Tailwind CSS v4 est configuré avec `@custom-variant dark` pour activer
 *    toutes les variantes `dark:*` des classes utilitaires quand cette classe est présente.
 *
 * 3. **Persistance** : on sauvegarde la valeur dans `localStorage` sous la clé `"theme"`
 *    (`"dark"` ou `"light"`) pour que le choix survive au rechargement de page.
 *
 * Retourne :
 * - `dark`   : booléen indiquant si le mode sombre est actif
 * - `toggle` : fonction pour basculer entre clair et sombre
 *
 * Utilisé dans `MainLayout.tsx` pour le bouton soleil/lune de la navbar.
 */
export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    // Fonction d'initialisation paresseuse — exécutée une seule fois au montage
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // Préférence système (macOS / Windows / Android dark mode)
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Ajoute la classe "dark" sur <html> si mode sombre, la retire sinon
    document.documentElement.classList.toggle('dark', dark);
    // Persiste le choix pour les visites ultérieures
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}
