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
| UI & Routage | React Router DOM | Navigation fluide entre les vues (Dashboard, Vault...) |
| Graph | react-force-graph-2d | Rendu physique et interactif de la Mind Map |
| Icônes | lucide-react | Pack SVG moderne et léger (sans marques tierces) |
| Style | CSS Modules + variables CSS custom | Dark mode natif, pas de framework CSS |
| Extension | Chrome Manifest V3 | Package séparé dans `/extension` |
| Tests | Vitest + Playwright | Unit (main) + E2E (renderer) |

---

## Structure du projet
lorekeeper/
├── electron/                  # Main process Node.js
│   ├── main.ts                # Entry point Electron (Initialisation DB & Search)
│   ├── preload.ts             # IPC bridge (contextBridge - loreKeeperAPI)
│   ├── ipc/                   # Handlers IPC par domaine
│   │   ├── notes.ipc.ts
│   │   ├── search.ipc.ts
│   │   ├── ai.ipc.ts
│   │   └── media.ipc.ts
│   └── services/              # Logique métier côté main
│       ├── db.service.ts      # Drizzle + connexion SQLite
│       ├── search.service.ts  # MiniSearch, synchronisation RAM <-> SQLite
│       ├── ai.service.ts      # Anthropic SDK
│       └── media.service.ts   # Whisper, OCR
│
├── src/                       # Renderer process (React)
│   ├── main.tsx               # Entry React
│   ├── App.tsx                # Router de vues (React Router)
│   ├── store/
│   │   └── vault.store.ts     # Zustand — état global (Notes)
│   ├── views/                 # Vues principales
│   │   ├── DashboardView.tsx  # Accueil, recherche rapide, raccourcis
│   │   ├── VaultView.tsx      # Bibliothèque, création et affichage grille
│   │   ├── ScriptView.tsx     # Éditeur central + panneau latéral (Drag & Drop)
│   │   ├── CaptureView.tsx    # Import sources (YouTube, OCR)
│   │   ├── GraphView.tsx      # Cartographie du lore (Force Graph 2D)
│   │   ├── TimelineView.tsx   # Chronologie horizontale interactive
│   │   ├── ExportView.tsx     # Générateur de script et bibliographie
│   │   └── SettingsView.tsx   # Paramètres (Thème, API IA, Raccourcis)
│   ├── components/            # Composants réutilisables
│   │   ├── NoteCard.tsx
│   │   ├── Editor.tsx
│   │   ├── OraclePanel.tsx    # Assistant IA
│   │   └── Sidebar.tsx        # Navigation gauche globale
│   └── hooks/
│       ├── useNotes.ts        # CRUD notes via IPC
│       └── useSearch.ts       # Hook de recherche RAM instantanée (< 100ms)
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