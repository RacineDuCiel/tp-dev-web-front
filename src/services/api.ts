import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Intercepteur JWT — injecte le Bearer token Keycloak dans chaque requête.
 * updateToken(30) rafraîchit le token s'il expire dans moins de 30 secondes,
 * ce qui évite les erreurs 401 dues à un token expiré en cours d'utilisation.
 * En cas d'échec du rafraîchissement, on force la reconnexion via keycloak.login().
 */
api.interceptors.request.use(async config => {
  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30);
    } catch {
      keycloak.login();
    }
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
  }
  return config;
});

export default api;
