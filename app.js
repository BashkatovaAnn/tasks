const STORAGE_KEY = "my-tasks-v1";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const deadlineInput = document.getElementById("task-deadline");
const list = document.getElementById("task-list");
const counter = document.getElementById("counter");
const clearDoneBtn = document.getElementById("clear-done");
const filterButtons = document.querySelectorAll(".filters button");
const nowEl = document.getElementById("now");

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

// ---------- Форматирование даты и времени ----------
function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(iso) {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

// ---------- Часы сверху ----------
function tickClock() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  nowEl.textContent = `${dateStr} · ${timeStr}`;
}

setInterval(tickClock, 1000);
tickClock();

// ---------- Рендер ----------
function render() {
  const visible = tasks.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  list.innerHTML = "";

  visible.forEach((task) => {
    const overdue = isOverdue(task.deadline) && !task.done;

    const li = document.createElement("li");
    li.className =
      "task-item" +
      (task.done ? " done" : "") +
      (overdue ? " overdue" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const body = document.createElement("div");
    body.className = "task-body";

    const textEl = document.createElement("span");
    textEl.className = "task-text";
    textEl.textContent = task.text;
    body.appendChild(textEl);

    if (task.deadline) {
      const dl = document.createElement("span");
      dl.className = "task-deadline";
      const prefix = overdue ? "Просрочено: " : "Сделать до: ";
      dl.textContent = prefix + formatDateTime(task.deadline);
      body.appendChild(dl);
    }

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "✕";
    del.title = "Удалить";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, body, del);
    list.appendChild(li);
  });

  const activeCount = tasks.filter((t) => !t.done).length;
  counter.textContent = `${activeCount} из ${tasks.length} осталось`;
}

// ---------- Действия ----------
function addTask(text, deadline) {
  tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    deadline: deadline || null,
    done: false,
    createdAt: new Date().toISOString(),
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

  const deadline = deadlineInput.value || null;
  addTask(text, deadline);

  input.value = "";
  deadlineInput.value = "";
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
    filterButtons.forEach((b) =>
      b.classList.toggle("active", b === btn)
    );
    render();
  });
});

// Обновлять подсветку просроченных задач каждую минуту
setInterval(render, 60 * 1000);

// ---------- Старт ----------
render();
