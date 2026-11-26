# Configuration Firebase de Micaplan

`firebase.js` contient la configuration Web Firebase fournie pour le projet `micaplan-e5ea4`. C'est une configuration cliente (elle n'est pas un mot de passe). Ne placez jamais de clé de compte de service dans le navigateur.

## Connecter le module à Micaplan

Le JavaScript principal de `index.html` est déjà un module (`<script type="module">`). Ajoutez cette ligne avec ses imports en haut du module :

```js
import { firebaseApp, db, analyticsReady } from './firebase.js';
```

La configuration initialise Firebase Analytics quand le navigateur le permet et initialise Firestore avec cache IndexedDB multi-onglets pour les données locales/hors connexion. Cette étape **ne sauvegarde pas encore les projets dans le cloud** : il faut encore créer la base de données Firestore dans la console Firebase, puis ajouter une authentification et des règles d'accès propres à chaque utilisateur avant d'autoriser les écritures.

## Sécurité Firestore

`firestore.rules` refuse toutes les lectures et écritures par défaut. C'est volontaire : n'utilisez pas de règles ouvertes du type `allow read, write: if true`. Déployez les règles sécurisées après avoir décidé du mode d'authentification et du format des documents.

## Exécution

Servez l'application par HTTPS (par exemple GitHub Pages ou Firebase Hosting). Les imports de modules Firebase depuis le CDN ne fonctionneront pas correctement en ouvrant simplement le fichier local `file://`.
