# tp-dev-web-front

Interface web de gestion d'une bibliotheque, developpee en React + TypeScript. L'authentification est deleguee a Keycloak via le flux PKCE (keycloak-js).

## Stack

- React 19 + TypeScript
- Vite (port 8080)
- Tailwind CSS v4
- React Router v7
- Axios (avec intercepteur JWT)
- keycloak-js 26

## Fonctionnalites

- Authentification SSO via Keycloak (realm `library-realm`, client `library-front`)
- CRUD complet sur les livres, les auteurs et les illustrations
- Recherche et filtrage cote client
- Gestion des relations : un livre peut avoir plusieurs auteurs et plusieurs illustrations
- Notifications toast, modale de confirmation avant suppression
- Interface responsive

## Prerequis

- Node.js >= 18
- Keycloak actif sur `http://localhost:8090` avec le realm `library-realm` configure
- API back disponible sur `http://localhost:8082`

## Lancement

```bash
npm install
npm run dev
```

L'application est accessible sur `http://localhost:8080`.
