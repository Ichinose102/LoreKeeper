# CLAUDE.md — LoreKeeper

Outil de gestion de connaissances pour créateurs de contenu Lore & Histoire.
Ce fichier est lu automatiquement par Claude Code à chaque session.

---

## Vision produit

LoreKeeper est une **application desktop Electron** (offline-first) permettant aux créateurs de contenu spécialisés en lore de capturer, organiser, relier et exporter leurs sources de recherche. Elle embarque un assistant IA (Oracle) pour l'analyse narrative.

---

## Stack technique

| Couche | Technologie | Raison |
|---|---|---|
| Desktop | Electron 29+ | Offline-first natif, accès filesystem |
| Frontend | React 18 + Vite 5 | Rapidité de dev, HMR |
| Langage | TypeScript 5 strict | Sécurité des types inter-couches |
| Base de données | SQLite via `better-sqlite3` | Embarqué, synchrone, FTS5 natif |
| ORM | Drizzle ORM | TypeScript-first, léger, migrations SQL propres |
| Search | MiniSearch | Index full-text en mémoire, < 100ms garanti |
| State | Zustand | Store global léger, pas de boilerplate |
| IA | Anthropic SDK (`@anthropic-ai/sdk`) | Claude Sonnet 4 pour l'Oracle |
| Transcription | OpenAI Whisper API | Extraction audio YouTube/Twitch |
| Style | CSS Modules + variables CSS custom | Dark mode natif, pas de framework CSS |
| Extension | Chrome Manifest V3 | Package séparé dans `/extension` |
| Tests | Vitest + Playwright | Unit (main) + E2E (renderer) |

---

## Structure du projet

```
lorekeeper/
├── electron/                  # Main process Node.js
│   ├── main.ts                # Entry point Electron
│   ├── preload.ts             # IPC bridge (contextBridge)
│   ├── ipc/                   # Handlers IPC par domaine
│   │   ├── notes.ipc.ts
│   │   ├── search.ipc.ts
│   │   ├── ai.ipc.ts
│   │   └── media.ipc.ts
│   └── services/              # Logique métier côté main
│       ├── db.service.ts      # Drizzle + connexion SQLite
│       ├── search.service.ts  # MiniSearch, indexation
│       ├── ai.service.ts      # Anthropic SDK
│       └── media.service.ts   # Whisper, OCR
│
├── src/                       # Renderer process (React)
│   ├── main.tsx               # Entry React
│   ├── App.tsx                # Router de vues
│   ├── store/
│   │   └── vault.store.ts     # Zustand — état global
│   ├── views/                 # Vues principales
│   │   ├── VaultView.tsx      # Archive + éditeur
│   │   ├── CaptureView.tsx    # Import sources
│   │   ├── GraphView.tsx      # Mind map
│   │   ├── TimelineView.tsx   # Chronologie
│   │   ├── ScriptView.tsx     # Éditeur script
│   │   └── ExportView.tsx     # Bibliographie + export
│   ├── components/            # Composants réutilisables
│   │   ├── NoteCard.tsx
│   │   ├── Editor.tsx
│   │   ├── OraclePanel.tsx    # Assistant IA
│   │   └── Sidebar.tsx
│   └── hooks/
│       ├── useNotes.ts        # CRUD notes via IPC
│       └── useSearch.ts       # Recherche instantanée
│
├── shared/                    # Types partagés main ↔ renderer
│   ├── types.ts               # Note, Tag, Timeline, etc.
│   └── ipc-channels.ts        # Constantes des canaux IPC
│
├── drizzle/                   # Schema et migrations
│   ├── schema.ts              # Tables Drizzle
│   └── migrations/            # SQL générés
│
├── extension/                 # Extension Chrome (Manifest V3)
│   ├── manifest.json
│   ├── background.ts
│   └── content.ts
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── CLAUDE.md                  # Ce fichier
├── package.json
├── electron.vite.config.ts
└── drizzle.config.ts
```

---

## Schéma de base de données

```sql
-- Notes (sources de lore)
notes (
  id          TEXT PRIMARY KEY,   -- uuid v4
  title       TEXT NOT NULL,
  type        TEXT NOT NULL,      -- 'note' | 'wiki' | 'video' | 'ocr'
  content     TEXT DEFAULT '',
  url         TEXT,
  era         TEXT,               -- Période narrative
  created_at  INTEGER NOT NULL,   -- Unix timestamp
  updated_at  INTEGER NOT NULL
)

-- Tags (many-to-many)
tags         (id, name UNIQUE)
notes_tags   (note_id, tag_id)

-- Liens bidirectionnels [[Note]]
note_links   (source_id, target_id)

-- Timeline
timeline_events (
  id, note_id, era, title, event_type, position INTEGER
)

-- Chunks de transcription vidéo
transcription_chunks (
  id, note_id, timestamp_ms INTEGER, text
)

-- FTS5 (recherche full-text)
notes_fts    (rowid → notes.rowid, title, content)
```

---

## IPC Bridge — canaux disponibles

Toutes les communications renderer → main passent par des canaux IPC typés.
Les constantes sont définies dans `shared/ipc-channels.ts`.

```typescript
// Exemples de canaux
'notes:getAll'       // → Note[]
'notes:create'       // NoteInput → Note
'notes:update'       // { id, patch } → Note
'notes:delete'       // id → void
'search:query'       // string → Note[]          (<100ms)
'ai:chat'            // { messages, context } → stream
'media:transcribe'   // { url } → TranscriptChunk[]
'media:ocr'          // { imagePath } → string
'export:bibliography'// void → string
'export:markdown'    // void → string
```

**Règle** : le renderer n'importe jamais `better-sqlite3`, `fs`, ou tout module Node. Tout passe par IPC.

---

## Conventions de code

### TypeScript
- `strict: true` dans `tsconfig.json`
- Pas de `any` — utiliser `unknown` + type guard si nécessaire
- Les types partagés vivent dans `shared/types.ts`, jamais dupliqués

### Nommage
- Fichiers : `kebab-case.ts` sauf composants React → `PascalCase.tsx`
- Variables/fonctions : `camelCase`
- Types/interfaces : `PascalCase`
- Constantes globales : `SCREAMING_SNAKE_CASE`
- Canaux IPC : `'domaine:action'` (ex: `'notes:create'`)

### React
- Composants fonctionnels uniquement, pas de classes
- Props typées avec `interface`, jamais `type` pour les props
- Un composant = un fichier
- Pas de logique métier dans les composants — tout dans les hooks ou le store
- `useCallback` / `useMemo` uniquement si profiling le justifie

### CSS
- CSS Modules (`.module.css`) pour les composants
- Variables CSS custom définies dans `src/styles/tokens.css`
- Dark mode via `prefers-color-scheme` — jamais de classe `.dark`
- Pas de styles inline sauf valeurs dynamiques

### SQLite / Drizzle
- `better-sqlite3` est **synchrone** — ne pas envelopper dans des fausses Promises inutiles
- Toutes les mutations passent par des transactions Drizzle
- FTS5 est mis à jour dans le même trigger que l'insert/update de `notes`
- Pas de requêtes brutes (raw SQL) sauf pour FTS5 et les migrations

### Gestion d'erreurs
- Les services `throw` des erreurs typées (`class NoteNotFoundError extends Error`)
- Les handlers IPC catchent et renvoient `{ ok: false, error: string }` au renderer
- Pas de `console.log` en production — utiliser le logger Electron (`electron-log`)

---

## Commandes utiles

```bash
# Développement
npm run dev              # Lance Electron + Vite HMR

# Base de données
npm run db:generate      # Génère les migrations Drizzle
npm run db:migrate       # Applique les migrations
npm run db:studio        # Drizzle Studio (UI SQLite)

# Tests
npm run test             # Vitest (unit)
npm run test:e2e         # Playwright (E2E)

# Build
npm run build            # Build production
npm run dist             # Package Electron (electron-builder)
```

---

## Règles de performance

- **Recherche < 100ms** : MiniSearch est chargé en mémoire au démarrage. Ne jamais faire de requête SQLite FTS5 dans le hot path de la recherche live.
- **Pas de re-render inutile** : les composants de liste (`NoteCard`) sont mémoïsés avec `React.memo`.
- **Offline first** : aucune fonctionnalité core ne doit dépendre du réseau. IA et transcription sont des features optionnelles avec fallback gracieux.
- **SQLite WAL mode** activé au démarrage (`PRAGMA journal_mode=WAL`) pour les lectures concurrentes.

---

## Variables d'environnement

Stockées dans `.env` (non committé). Chargées dans le main process uniquement.

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # Pour Whisper
```

**Ne jamais** exposer ces clés au renderer via `contextBridge`. Les appels API se font exclusivement dans `electron/services/`.

---

## Phases de développement

| Phase | Contenu | Statut |
|---|---|---|
| 1 | Scaffold Electron + Vite + TypeScript + IPC bridge | 🔲 |
| 2 | Schema SQLite + Drizzle + CRUD notes | 🔲 |
| 3 | MiniSearch + search service (< 100ms) | 🔲 |
| 4 | UI React — migration prototype vers composants | 🔲 |
| 5 | Services IA (Oracle) + Whisper + OCR | 🔲 |
| 6 | Extension Chrome Manifest V3 | 🔲 |

---

## Ce que Claude Code doit savoir

- Ce projet est en cours de construction — commencer par la Phase 1
- Le prototype UI existe en HTML/JS dans `docs/prototype.html` — s'en inspirer pour le style
- Le design est **dark mode natif**, palette basée sur `--gold: #c9a84c` et `--teal: #4aa8a0`
- La police d'affichage est Cinzel (titres), Source Serif 4 (corps), JetBrains Mono (code/meta)
- `better-sqlite3` est **synchrone** — ne pas confondre avec `sqlite3` async
- Toujours vérifier que le renderer n'importe pas de modules Node natifs
- Les tests unitaires couvrent les services (main process), les tests E2E couvrent les flux utilisateur