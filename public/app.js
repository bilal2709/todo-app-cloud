const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoTemplate = document.getElementById('todo-template');
const emptyState = document.getElementById('empty-state');
const flashMessage = document.getElementById('flash-message');
const todoCount = document.getElementById('todo-count');
const storageMode = document.getElementById('storage-mode');

let todos = [];
let runtimeStorageMode = 'browser';

function showMessage(message, isError = false) {
  flashMessage.textContent = message;
  flashMessage.style.color = isError ? '#ff9f9f' : '';
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function updateCounters() {
  todoCount.textContent = String(todos.length);
  emptyState.classList.toggle('hidden', todos.length > 0);
}

function readBrowserTodos() {
  try {
    const raw = localStorage.getItem('lime-todos');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function writeBrowserTodos(nextTodos) {
  localStorage.setItem('lime-todos', JSON.stringify(nextTodos));
}

function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `todo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function browserCreateTodo(text) {
  const now = new Date().toISOString();
  const todo = {
    id: generateId(),
    text,
    createdAt: now,
    updatedAt: now,
  };

  const nextTodos = [todo, ...readBrowserTodos()];
  writeBrowserTodos(nextTodos);
  return todo;
}

function browserUpdateTodo(id, text) {
  let updatedTodo = null;

  const nextTodos = readBrowserTodos().map((todo) => {
    if (todo.id !== id) {
      return todo;
    }

    updatedTodo = {
      ...todo,
      text,
      updatedAt: new Date().toISOString(),
    };

    return updatedTodo;
  });

  writeBrowserTodos(nextTodos);
  return updatedTodo;
}

function browserDeleteTodo(id) {
  const nextTodos = readBrowserTodos().filter((todo) => todo.id !== id);
  writeBrowserTodos(nextTodos);
}

function renderTodos() {
  todoList.innerHTML = '';

  todos.forEach((todo) => {
    const fragment = todoTemplate.content.cloneNode(true);
    const item = fragment.querySelector('.todo-item');
    const todoText = fragment.querySelector('.todo-text');
    const todoDate = fragment.querySelector('.todo-date');
    const editForm = fragment.querySelector('.edit-form');
    const editInput = fragment.querySelector('.edit-input');
    const editButton = fragment.querySelector('[data-action="edit"]');
    const deleteButton = fragment.querySelector('[data-action="delete"]');
    const cancelButton = fragment.querySelector('[data-action="cancel"]');

    todoText.textContent = todo.text;
    todoDate.textContent = `Mis à jour le ${formatDate(todo.updatedAt)}`;
    editInput.value = todo.text;
    item.dataset.id = todo.id;

    editButton.addEventListener('click', () => {
      editForm.classList.toggle('hidden');
      editInput.focus();
      editInput.select();
    });

    cancelButton.addEventListener('click', () => {
      editForm.classList.add('hidden');
      editInput.value = todo.text;
    });

    deleteButton.addEventListener('click', () => {
      browserDeleteTodo(todo.id);
      todos = todos.filter((entry) => entry.id !== todo.id);
      renderTodos();
      updateCounters();
      showMessage('Todo supprimée avec succès.');
    });

    editForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const text = editInput.value.trim();

      if (!text) {
        showMessage('Le texte modifié ne peut pas être vide.', true);
        return;
      }

      const updatedTodo = browserUpdateTodo(todo.id, text);

      if (!updatedTodo) {
        showMessage('Todo introuvable.', true);
        return;
      }

      todos = todos.map((entry) => (entry.id === updatedTodo.id ? updatedTodo : entry));
      renderTodos();
      updateCounters();
      showMessage('Todo modifiée avec succès.');
    });

    todoList.appendChild(fragment);
  });
}

function loadTodos() {
  todos = readBrowserTodos();
  renderTodos();
  updateCounters();
  storageMode.textContent = 'local navigateur';
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();

  if (!text) {
    showMessage('Merci de saisir une todo.', true);
    return;
  }

  const createdTodo = browserCreateTodo(text);
  todos = [createdTodo, ...todos];
  renderTodos();
  updateCounters();
  todoForm.reset();
  todoInput.focus();
  showMessage('Todo ajoutée avec succès.');
});

loadTodos();