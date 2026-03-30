import Keycloak from 'keycloak-js';

/**
 * Instance Keycloak singleton — partagée par AuthContext et l'intercepteur Axios.
 * Keycloak est exposé sur le port 8090 (voir kc-compose/docker-compose.yml).
 * Realm : library-realm / Client : library-front
 */
const keycloak = new Keycloak({
  url: 'http://localhost:8090',
  realm: 'library-realm',
  clientId: 'library-front',
});

export default keycloak;
