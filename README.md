<<<<<<< HEAD
# Todo_APP_Azure
=======
# Lime Todo App

Application todo simple avec :
- ajout d'une todo
- affichage dans une liste
- modification d'une todo
- suppression d'une todo
- stockage dans Azure Cosmos DB si la configuration est fournie
- fallback en mémoire locale si Cosmos DB n'est pas encore configuré

## 1) Installation

```bash
npm install
```

## 2) Configuration

Copie `.env.example` vers `.env` puis remplace les valeurs par les tiennes.

```bash
cp .env.example .env
```

Exemple :

```env
PORT=3000
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=your-primary-key
COSMOS_DATABASE_ID=TodoApp
COSMOS_CONTAINER_ID=Todos
```

## 3) Lancement

```bash
npm start
```

Puis ouvre :

```text
http://localhost:3000
```

## 4) Déploiement Azure

Tu pourras ensuite :
- déployer cette app sur Azure App Service ou Azure Container Apps
- ajouter tes variables d'environnement dans la configuration Azure
- connecter l'app à ton instance Azure Cosmos DB

## Structure

```text
todo-cosmos-app/
├── db/
│   └── cosmos.js
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── .env.example
├── package.json
├── README.md
└── server.js
```

## API

- `GET /api/health`
- `GET /api/todos`
- `POST /api/todos`
- `PUT /api/todos/:id`
- `DELETE /api/todos/:id`
>>>>>>> 7db665b (Premier commit)
