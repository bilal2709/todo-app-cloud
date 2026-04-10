require('dotenv').config();

const express = require('express');
const path = require('node:path');
const {
  isCosmosConfigured,
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require('./db/cosmos');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    storage: isCosmosConfigured() ? 'azure-cosmos-db' : 'local-memory',
  });
});

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await listTodos();
    res.json(todos);
  } catch (error) {
    console.error('GET /api/todos failed', error);
    res.status(500).json({ message: 'Impossible de récupérer les todos.' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();

    if (!text) {
      return res.status(400).json({ message: 'Le texte de la todo est obligatoire.' });
    }

    const todo = await createTodo(text);
    res.status(201).json(todo);
  } catch (error) {
    console.error('POST /api/todos failed', error);
    res.status(500).json({ message: 'Impossible de créer la todo.' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();

    if (!text) {
      return res.status(400).json({ message: 'Le nouveau texte est obligatoire.' });
    }

    const todo = await updateTodo(req.params.id, text);

    if (!todo) {
      return res.status(404).json({ message: 'Todo introuvable.' });
    }

    res.json(todo);
  } catch (error) {
    console.error('PUT /api/todos/:id failed', error);
    res.status(500).json({ message: 'Impossible de modifier la todo.' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const deleted = await deleteTodo(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Todo introuvable.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('DELETE /api/todos/:id failed', error);
    res.status(500).json({ message: 'Impossible de supprimer la todo.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Todo app lancée sur http://localhost:${port}`);
  console.log(
    isCosmosConfigured()
      ? 'Stockage : Azure Cosmos DB'
      : 'Stockage : mémoire locale (configure .env pour Cosmos DB)'
  );
});
