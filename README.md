# TAF Market

Marketplace web React/Vite pour acheteurs, vendeurs et partenaires en Afrique et à l'international.

## Fonctions présentes dans l'interface
- Page d'accueil responsive.
- Catalogue avec recherche et filtre par catégorie.
- Panier local conservé sur l'appareil, avec totaux séparés par devise (aperçu uniquement, sans paiement).
- Inscription / connexion par e-mail via Supabase, lorsque le projet est configuré.
- Publication de produits par les utilisateurs connectés.
- Espace vendeur : liste des produits personnels, masquage / remise en vente et suppression (protégés par les règles RLS Supabase).
- Page d'information sur le programme d'affiliation.

## Démarrage local
```bash
npm install
cp .env.example .env
npm run dev
```

Renseigner dans `.env` les valeurs du projet Supabase :
- `VITE_SUPABASE_URL` : URL du projet.
- `VITE_SUPABASE_ANON_KEY` : clé publique anon/publishable du projet.

Ne jamais mettre une clé `service_role`, un mot de passe ou une clé privée dans le navigateur ou dans GitHub.

## Base de données Supabase
Après vérification des tables déjà présentes, ouvrir SQL Editor et appliquer :
`supabase/migrations/202611100001_marketplace.sql` puis `supabase/migrations/202611100002_affiliate_codes.sql`

Ces migrations préparent les profils, les produits, les politiques RLS, la création automatique d'un profil après inscription et les codes personnels d'affiliation. Vérifier les politiques existantes avant application si le projet contient déjà des règles personnalisées.

## Paiements et affiliation
Le panier actuel est un aperçu local. Aucun paiement réel n'est encaissé. Mobile Money et cartes nécessitent un prestataire de paiement, des identifiants marchands, des webhooks côté serveur et des tests avant activation.
Le code personnel d'affiliation peut être créé lorsque Supabase est configuré et que les deux migrations ont été appliquées. Les liens de tracking, l'attribution des ventes et les commissions ne sont pas encore activés.

## Compilation
```bash
npm run build
```
