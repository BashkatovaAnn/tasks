const STORAGE_KEY = "my-tasks-v1";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const counter = document.getElementById("counter");
const clearDoneBtn = document.getElementById("clear-done");
const filterButtons = document.querySelectorAll(".filters button");

let tasks = loadTasks();
let currentFilter = "all";

// ---------- Хранилище ----------
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Рендер ----------
function render() {
  const visible = tasks.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  list.innerHTML = "";

  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const span = document.createElement("span");
    span.textContent = task.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "✕";
    del.title = "Удалить";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, span, del);
    list.appendChild(li);
  });

  const activeCount = tasks.filter((t) => !t.done).length;
  counter.textContent = `${activeCount} из ${tasks.length} осталось`;

  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });
}

// ---------- Действия ----------
function addTask(text) {
  tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    done: false,
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const t = tasks.find((t) => t.id === id);
  if (t) {
    t.done = !t.done;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

// ---------- События ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

clearDoneBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ---------- Старт ----------
render();