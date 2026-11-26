# Firebase Micaplan — connexion rapide

Le projet Firebase `micaplan-e5ea4` a Firestore et la connexion Google configurés dans la console. `firebase.js` initialise Firebase; `firebase-auth.js` ajoute la connexion Google, la sauvegarde cloud et la restauration.

## Dernière étape de branchement au site

Dans `index.html`, repérez le `<script type="module">` principal et ajoutez l'import ci-dessous juste après les imports de Three.js :

```js
import './firebase-auth.js';
```

Enregistrez le fichier. L'import est nécessaire : créer les fichiers seuls ne modifie pas automatiquement la page.

## Utilisation

1. Publiez le site en HTTPS (GitHub Pages ou Firebase Hosting).
2. Ouvrez Micaplan et appuyez sur **Connexion Google**.
3. Dans l'application, appuyez d'abord sur **Enregistrer** (sauvegarde locale), puis **Enregistrer dans le cloud**. La sauvegarde cloud se synchronise aussi après le bouton Enregistrer local si l'utilisateur est connecté.
4. **Restaurer du cloud** recharge le fichier dans l'outil d'import de Micaplan.

Les données sont stockées dans `users/{uid}/projects/current`; les règles `firestore.rules` limitent l'accès au propriétaire connecté. Déployez ces règles dans Firebase Console → Firestore Database → Règles, ou avec Firebase CLI. Ne publiez jamais de règles ouvertes.

Le code ne peut pas être activé depuis la console Firebase seule : il faut publier le changement de `index.html` dans le dépôt et attendre la fin du déploiement du site.
