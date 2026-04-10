const { CosmosClient } = require('@azure/cosmos');
const crypto = require('node:crypto');

const localTodos = new Map();
let containerPromise = null;

function isCosmosConfigured() {
  return Boolean(
    process.env.COSMOS_ENDPOINT &&
      process.env.COSMOS_KEY &&
      process.env.COSMOS_DATABASE_ID &&
      process.env.COSMOS_CONTAINER_ID
  );
}

async function getContainer() {
  if (!isCosmosConfigured()) {
    return null;
  }

  if (!containerPromise) {
    containerPromise = (async () => {
      const client = new CosmosClient({
        endpoint: process.env.COSMOS_ENDPOINT,
        key: process.env.COSMOS_KEY,
      });

      const { database } = await client.databases.createIfNotExists({
        id: process.env.COSMOS_DATABASE_ID,
      });

      const { container } = await database.containers.createIfNotExists({
        id: process.env.COSMOS_CONTAINER_ID,
        partitionKey: {
          paths: ['/id'],
        },
      });

      return container;
    })();
  }

  return containerPromise;
}

function normalizeTodo(todo) {
  return {
    id: todo.id,
    text: todo.text,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  };
}

async function listTodos() {
  const container = await getContainer();

  if (!container) {
    return Array.from(localTodos.values())
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(normalizeTodo);
  }

  const querySpec = {
    query: 'SELECT * FROM c ORDER BY c.updatedAt DESC',
  };

  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources.map(normalizeTodo);
}

async function createTodo(text) {
  const now = new Date().toISOString();
  const todo = {
    id: crypto.randomUUID(),
    text,
    createdAt: now,
    updatedAt: now,
  };

  const container = await getContainer();

  if (!container) {
    localTodos.set(todo.id, todo);
    return normalizeTodo(todo);
  }

  const { resource } = await container.items.upsert(todo);
  return normalizeTodo(resource);
}

async function updateTodo(id, text) {
  const container = await getContainer();

  if (!container) {
    const existing = localTodos.get(id);
    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      text,
      updatedAt: new Date().toISOString(),
    };

    localTodos.set(id, updated);
    return normalizeTodo(updated);
  }

  try {
    const { resource: existing } = await container.item(id, id).read();
    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      text,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await container.items.upsert(updated);
    return normalizeTodo(resource);
  } catch (error) {
    if (error?.code === 404) {
      return null;
    }
    throw error;
  }
}

async function deleteTodo(id) {
  const container = await getContainer();

  if (!container) {
    const existed = localTodos.delete(id);
    return existed;
  }

  try {
    await container.item(id, id).delete();
    return true;
  } catch (error) {
    if (error?.code === 404) {
      return false;
    }
    throw error;
  }
}

module.exports = {
  isCosmosConfigured,
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
