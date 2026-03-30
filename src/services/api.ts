import axios from 'axios';

// Instance Axios partagée par tous les services.
// On ajoutera un intercepteur JWT ici lors de la Phase 3 (Keycloak).
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;
