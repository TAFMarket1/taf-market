# TAF Market

Marketplace multi-vendeurs avec espaces acheteur, vendeur et affilié.

## Développement

```bash
npm install
npm run dev
```

## Vérification de production

```bash
npm run build
npm run preview
```

## Configuration Supabase

Créer un fichier local `.env` à la racine du projet avec les variables suivantes :

```env
VITE_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_PUBLIQUE_ANON
```

Ne jamais placer une clé `service_role` ou une clé secrète dans le navigateur, dans GitHub ou dans une variable `VITE_`. Configurer également ces variables dans les paramètres de l'hébergeur avant le déploiement.

Les paiements Mobile Money et par carte ne sont pas encore intégrés.
