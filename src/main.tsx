/**
 * Point d'entrée de l'application React.
 *
 * `createRoot` est l'API React 18+ pour le rendu concurrent.
 * Elle remplace l'ancienne `ReactDOM.render()` et active les fonctionnalités
 * de Concurrent Mode (transitions, suspense, etc.).
 *
 * `StrictMode` exécute certains hooks deux fois en développement pour détecter
 * les effets de bord non idempotents et les comportements deprecated.
 * Il n'a aucun impact en production.
 *
 * L'import de `./index.css` charge Tailwind CSS v4 (via `@import "tailwindcss"`)
 * ainsi que les keyframes d'animation personnalisées (toast, modal, page).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
