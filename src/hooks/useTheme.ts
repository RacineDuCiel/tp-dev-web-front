import { useEffect, useState } from 'react';

/**
 * Hook personnalisé de gestion du thème clair/sombre.
 *
 * Fonctionnement :
 * 1. **Initialisation** : priorité au cookie `theme` (partagé avec Keycloak sur localhost),
 *    puis fallback sur localStorage, puis sur la préférence système `prefers-color-scheme`.
 *    L'ordre cookie > localStorage permet la synchronisation avec la page de login Keycloak
 *    qui tourne sur un port différent (localStorage est isolé par origine, les cookies non).
 *
 * 2. **Application** : à chaque changement de `dark`, on ajoute/retire la classe `"dark"`
 *    sur `<html>`. Tailwind CSS v4 est configuré avec `@custom-variant dark` pour activer
 *    toutes les variantes `dark:*` des classes utilitaires quand cette classe est présente.
 *
 * 3. **Persistance** : on sauvegarde la valeur dans localStorage ET dans un cookie.
 *    - localStorage : lecture rapide, même origine.
 *    - Cookie `theme` : partagé entre toutes les origines sur `localhost` (ports inclus),
 *      ce qui permet à la page Keycloak (localhost:8090) de lire le choix fait ici
 *      (localhost:5173) et vice-versa.
 *
 * Retourne :
 * - `dark`   : booléen indiquant si le mode sombre est actif
 * - `toggle` : fonction pour basculer entre clair et sombre
 *
 * Utilisé dans `MainLayout.tsx` pour le bouton soleil/lune de la navbar.
 */

/** Lit le cookie `theme` s'il existe, sinon retourne null. */
function readThemeCookie(): string | null {
  return document.cookie.match(/(?:^|;\s*)theme=([^;]+)/)?.[1] ?? null;
}

/** Écrit le cookie `theme` — partagé sur tout localhost sans restriction de port. */
function writeThemeCookie(value: string) {
  document.cookie = `theme=${value}; path=/; SameSite=Lax; max-age=31536000`;
}

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    // 1. Cookie (partagé avec Keycloak sur localhost:8090)
    const cookie = readThemeCookie();
    if (cookie) return cookie === 'dark';
    // 2. localStorage (même origine uniquement)
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // 3. Préférence système (macOS / Windows / Android dark mode)
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const value = dark ? 'dark' : 'light';
    // Ajoute la classe "dark" sur <html> pour les variantes Tailwind dark:*
    document.documentElement.classList.toggle('dark', dark);
    // Persistance locale
    localStorage.setItem('theme', value);
    // Persistance partagée avec Keycloak (cookie visible sur tout localhost)
    writeThemeCookie(value);
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}
