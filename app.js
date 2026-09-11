// ---------- Константы ----------
const STORAGE_KEY = "my-tasks-v1";
const BIRTHDAYS_KEY = "my-birthdays-v1";
const SCHEDULE_KEY = "my-work-schedule-v1";
const SETTINGS_KEY = "my-settings-v1";

const HOLIDAYS_API_BASE = "https://date.nager.at/api/v3";
const HOLIDAYS_COUNTRY = "RU";
const HOLIDAYS_CACHE_KEY = "my-tasks-holidays-v1";

const WEEKDAYS_FULL = [
  "Понедельник", "Вторник", "Среда", "Четверг",
  "Пятница", "Суббота", "Воскресенье",
];
const WEEKDAYS_SHORT = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const MONTHS_NOM = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const MONTH_MAX_TASKS = 3;
const REPEAT_LABELS = {
  none: "",
  daily: "ежедневно",
  weekdays: "по будням",
  weekly: "еженедельно",
  monthly: "ежемесячно",
  yearly: "ежегодно",
};

const DEFAULT_SCHEDULE = {
  startDate: "2026-09-12",
  workDays: 2,
  restDays: 2,
};

const DEFAULT_SETTINGS = {
  workStart: "09:00",
  workEnd: "18:00",
  compact: false,
};

// ---------- Элементы ----------
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const dateInput = document.getElementById("task-date");
const timeInput = document.getElementById("task-time");
const noTimeCheckbox = document.getElementById("no-time");
const timeRow = document.querySelector(".time-row");
const listUnscheduled = document.getElementById("unscheduled-list");
const unscheduledSection = document.getElementById("unscheduled-section");
const counter = document.getElementById("counter");
const nowEl = document.getElementById("now");
const holidayEl = document.getElementById("holiday");
const workdayEl = document.getElementById("workday");
const birthdayBanner = document.getElementById("birthday-banner");
const todayView = document.getElementById("today-view");
const weekList = document.getElementById("week-list");
const monthView = document.getElementById("month-view");
const monthWeekdays = document.getElementById("month-weekdays");
const monthGrid = document.getElementById("month-grid");
const periodTitle = document.getElementById("period-title");
const periodNav = document.getElementById("period-nav");
const prevBtn = document.getElementById("prev-period");
const nextBtn = document.getElementById("next-period");
const todayBtn = document.getElementById("today-btn");
const viewButtons = document.querySelectorAll(".view-switch button");
const birthdaysBtn = document.getElementById("birthdays-btn");
const statsBtn = document.getElementById("stats-btn");
const settingsBtn = document.getElementById("settings-btn");

// Модалка задачи
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const editForm = document.getElementById("edit-form");
const editText = document.getElementById("edit-text");
const editDate = document.getElementById("edit-date");
const editTime = document.getElementById("edit-time");
const editNoTime = document.getElementById("edit-no-time");
const editRepeat = document.getElementById("edit-repeat");
const editComment = document.getElementById("edit-comment");
const editDelete = document.getElementById("edit-delete");
const editCancel = document.getElementById("edit-cancel");

// Модалка дней рождения
const bdModal = document.getElementById("bd-modal");
const bdModalClose = document.getElementById("bd-modal-close");
const bdForm = document.getElementById("bd-form");
const bdName = document.getElementById("bd-name");
const bdDate = document.getElementById("bd-date");
const bdNote = document.getElementById("bd-note");
const bdList = document.getElementById("bd-list");
const bdSubmit = document.getElementById("bd-submit");
const bdCancelEdit = document.getElementById("bd-cancel-edit");

// Модалка статистики
const statsModal = document.getElementById("stats-modal");
const statsClose = document.getElementById("stats-close");
const statsGrid = document.getElementById("stats-grid");
const statsButtons = document.querySelectorAll(".stats-switch button");

// Модалка настроек
const settingsModal = document.getElementById("settings-modal");
const settingsClose = document.getElementById("settings-close");
const setWorkStart = document.getElementById("set-work-start");
const setWorkEnd = document.getElementById("set-work-end");
const setCompact = document.getElementById("set-compact");
const schedStart = document.getElementById("sched-start");
const schedWork = document.getElementById("sched-work");
const schedRest = document.getElementById("sched-rest");
const schedTitle = document.getElementById("sched-title");
const schedWeekdays = document.getElementById("sched-weekdays");
const schedGrid = document.getElementById("sched-grid");
const schedPrev = document.getElementById("sched-prev");
const schedNext = document.getElementById("sched-next");
const schedToday = document.getElementById("sched-today");

// ---------- Состояние ----------
let tasks = loadTasks();
let birthdays = loadBirthdays();
let schedule = loadSchedule();
let settings = loadSettings();
let weekOffset = 0;
let monthOffset = 0;
let schedMonthOffset = 0;
let currentView = "week";
let statsScope = "week";
let editingId = null;
let editingBdId = null;
let holidaysCache = loadHolidaysCache();

// ---------- Хранилище ----------
function loadTasks() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}
function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function loadBirthdays() {
  try {
    const raw = JSON.parse(localStorage.getItem(BIRTHDAYS_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}
function saveBirthdays() { localStorage.setItem(BIRTHDAYS_KEY, JSON.stringify(birthdays)); }

function loadSchedule() {
  try {
    const raw = JSON.parse(localStorage.getItem(SCHEDULE_KEY));
    if (!raw || typeof raw !== "object") return { ...DEFAULT_SCHEDULE };
    return {
      startDate: raw.startDate || DEFAULT_SCHEDULE.startDate,
      workDays: Math.max(1, Math.min(15, Number(raw.workDays) || DEFAULT_SCHEDULE.workDays)),
      restDays: Math.max(1, Math.min(15, Number(raw.restDays) || DEFAULT_SCHEDULE.restDays)),
    };
  } catch { return { ...DEFAULT_SCHEDULE }; }
}
function saveSchedule() { localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule)); }

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };
    return {
      workStart: raw.workStart || DEFAULT_SETTINGS.workStart,
      workEnd: raw.workEnd || DEFAULT_SETTINGS.workEnd,
      compact: Boolean(raw.compact),
    };
  } catch { return { ...DEFAULT_SETTINGS }; }
}
function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

function loadHolidaysCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(HOLIDAYS_CACHE_KEY));
    return raw && typeof raw === "object" ? raw : {};
  } catch { return {}; }
}
function saveHolidaysCache() { localStorage.setItem(HOLIDAYS_CACHE_KEY, JSON.stringify(holidaysCache)); }

// ---------- Праздники ----------
async function ensureHolidaysForYear(year) {
  const key = String(year);
  if (holidaysCache[key]) return;
  try {
    const res = await fetch(`${HOLIDAYS_API_BASE}/PublicHolidays/${year}/${HOLIDAYS_COUNTRY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const byMonthDay = {};
    data.forEach((h) => {
      const [, mm, dd] = h.date.split("-");
      const md = `${mm}-${dd}`;
      (byMonthDay[md] ||= []).push(h.localName || h.name);
    });
    holidaysCache[key] = byMonthDay;
    saveHolidaysCache();
    updateHoliday(new Date());
  } catch (e) {
    console.warn("Не удалось загрузить праздники:", e);
    holidaysCache[key] = {};
    saveHolidaysCache();
  }
}

function updateHoliday(date) {
  const year = date.getFullYear();
  const md = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const list = holidaysCache[String(year)]?.[md] || [];
  if (list.length > 0) {
    holidayEl.textContent = "🎉 " + list.join(" · ");
    holidayEl.hidden = false;
  } else {
    holidayEl.hidden = true;
  }
}

// ---------- Таймер рабочего дня ----------
function parseHM(str) {
  const [h, m] = (str || "09:00").split(":").map(Number);
  return { h: h || 0, m: m || 0 };
}

function updateWorkdayTimer(now) {
  const day = now.getDay();
  const isWeekday = day >= 1 && day <= 5;
  if (!isWeekday) { workdayEl.hidden = true; return; }

  const { h: sh, m: sm } = parseHM(settings.workStart);
  const { h: eh, m: em } = parseHM(settings.workEnd);

  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end = new Date(now); end.setHours(eh, em, 0, 0);

  workdayEl.hidden = false;

  if (now < start) {
    workdayEl.innerHTML = `<span class="workday-label">До начала рабочего дня:</span> <span class="workday-time">${formatDuration(start - now)}</span>`;
    return;
  }
  if (now >= end) {
    workdayEl.innerHTML = `<span class="workday-label">Рабочий день закончен 🎉</span>`;
    return;
  }
  workdayEl.innerHTML = `<span class="workday-label">До конца рабочего дня:</span> <span class="workday-time">${formatDuration(end - now)}</span>`;
}

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} мин`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}

// ---------- Дни рождения ----------
function bdMonthDay(bd) {
  if (!bd.date) return null;
  const [, mm, dd] = bd.date.split("-");
  return `${mm}-${dd}`;
}
function birthdaysForDate(date) {
  const md = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return birthdays.filter((b) => bdMonthDay(b) === md);
}
function upcomingBirthdays(now) {
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  return { today: birthdaysForDate(today), tomorrow: birthdaysForDate(tomorrow) };
}
function ageInYear(bd, year) {
  if (!bd.date) return null;
  const [y] = bd.date.split("-").map(Number);
  if (!y || y <= 1900) return null;
  const age = year - y;
  return age >= 0 && age < 150 ? age : null;
}
function updateBirthdayBanner(now) {
  const { today, tomorrow } = upcomingBirthdays(now);
  const parts = [];
  if (today.length) parts.push("Сегодня день рождения: " + today.map((b) => b.name).join(", "));
  if (tomorrow.length) parts.push("Завтра: " + tomorrow.map((b) => b.name).join(", "));
  if (parts.length === 0) { birthdayBanner.hidden = true; birthdayBanner.textContent = ""; }
  else {
    birthdayBanner.textContent = "🎂 " + parts.join(" · ");
    birthdayBanner.hidden = false;
  }
}

// ---------- График работы ----------
function scheduleStatusForDate(date) {
  const start = parseDateOnly(schedule.startDate);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((d - start) / 86400000);
  const cycle = schedule.workDays + schedule.restDays;
  const pos = ((diffDays % cycle) + cycle) % cycle;
  return pos < schedule.workDays ? "work" : "rest";
}
function parseDateOnly(str) {
  if (!str) return new Date(1970, 0, 1);
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ---------- Утилиты дат ----------
function startOfWeek(date) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function addMonths(date, months) {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return d;
}
function dayKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function deadlineDayKey(iso) { return iso ? dayKey(new Date(iso)) : null; }
function isoToDateStr(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isoToTimeStr(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function formatTime(task) {
  if (!task.hasTime) return "на день";
  const d = new Date(task.deadline);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
function isOverdue(task) {
  if (task.done) return false;
  if (!task.deadline) return false;
  const now = new Date();
  const d = new Date(task.deadline);
  if (task.hasTime) return d.getTime() < now.getTime();
  const endOfDay = new Date(d);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() < now.getTime();
}
function makeDeadlineFromInputs(dateStr, timeStr, hasTime) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (hasTime && timeStr) {
    const [hh, mm] = timeStr.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0).toISOString();
  }
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
}
function makeDeadlineForMove(targetDate, oldTask) {
  const d = new Date(targetDate);
  if (oldTask.deadline && oldTask.hasTime) {
    const old = new Date(oldTask.deadline);
    d.setHours(old.getHours(), old.getMinutes(), 0, 0);
  } else {
    d.setHours(12, 0, 0, 0);
  }
  return d.toISOString();
}

// ---------- Повторяющиеся задачи ----------
// Проверяет, попадает ли задача в указанный день (учитывая repeat)
function taskOccursOnDate(task, date) {
  const base = task.deadline ? new Date(task.deadline) : null;
  if (!base) return false;
  base.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  if (d < base) return false;

  const rep = task.repeat || "none";
  if (rep === "none") return d.getTime() === base.getTime();

  const dow = d.getDay(); // 0..6
  const baseDow = base.getDay();
  const baseDay = base.getDate();
  const baseMonth = base.getMonth();

  switch (rep) {
    case "daily":
      return true;
    case "weekdays":
      return dow >= 1 && dow <= 5;
    case "weekly":
      return dow === baseDow;
    case "monthly":
      return d.getDate() === baseDay;
    case "yearly":
      return d.getDate() === baseDay && d.getMonth() === baseMonth;
    default:
      return false;
  }
}

// Проверяет, выполнена ли задача на конкретную дату (для повторов)
function isTaskDoneOn(task, date) {
  if (task.repeat && task.repeat !== "none") {
    const key = dayKey(date);
    return Array.isArray(task.doneOn) && task.doneOn.includes(key);
  }
  return Boolean(task.done);
}

// Установить/снять выполнение для конкретной даты
function setTaskDoneOn(task, date, value) {
  if (task.repeat && task.repeat !== "none") {
    const key = dayKey(date);
    task.doneOn = task.doneOn || [];
    if (value && !task.doneOn.includes(key)) task.doneOn.push(key);
    if (!value) task.doneOn = task.doneOn.filter((k) => k !== key);
  } else {
    task.done = value;
  }
}

// Виртуальные копии повторяющихся задач на дату
function virtualTaskForDate(task, date) {
  if (!taskOccursOnDate(task, date)) return null;
  const isRepeat = task.repeat && task.repeat !== "none";
  if (!isRepeat) return task; // обычная задача

  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return {
    ...task,
    id: `${task.id}@${dayKey(date)}`,   // виртуальный id
    originalId: task.id,                 // ссылка на оригинал
    isRepeat: true,
    deadline: d.toISOString(),
    done: isTaskDoneOn(task, date),
  };
}

// ---------- Часы ----------
function tickClock() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ru-RU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("ru-RU", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  nowEl.textContent = `${dateStr} · ${timeStr}`;
  updateHoliday(now);
  updateWorkdayTimer(now);
  updateBirthdayBanner(now);
}
setInterval(tickClock, 1000);
tickClock();

// ---------- Заголовок периода ----------
function updatePeriodTitle() {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  if (currentView === "today") {
    periodNav.hidden = true;
    return;
  }
  periodNav.hidden = false;

  if (currentView === "week") {
    const weekStart = addDays(startOfWeek(today), weekOffset * 7);
    const weekEnd = addDays(weekStart, 6);
    const s = `${weekStart.getDate()} ${MONTHS_GEN[weekStart.getMonth()]}`;
    const e = `${weekEnd.getDate()} ${MONTHS_GEN[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
    periodTitle.textContent = `${s} — ${e}`;
  } else {
    const m = addMonths(today, monthOffset);
    periodTitle.textContent = `${MONTHS_NOM[m.getMonth()]} ${m.getFullYear()}`;
  }
}

// ---------- Главный рендер ----------
function render() {
  updatePeriodTitle();

  todayView.hidden = currentView !== "today";
  weekList.hidden = currentView !== "week";
  monthView.hidden = currentView !== "month";

  if (currentView === "today") renderToday();
  else if (currentView === "week") renderWeek();
  else renderMonth();

  renderUnscheduled();
  updateCounter();
  applyCompactMode();
}

// ---------- Вид «Сегодня» ----------
function renderToday() {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  todayView.innerHTML = "";

  // Собираем задачи на сегодня
  const dayTasks = tasks.filter((t) => {
    const v = virtualTaskForDate(t, today);
    if (!v) return false;
    // показываем только задачи с датой сегодня
    return true;
  }).map((t) => virtualTaskForDate(t, today)).filter(Boolean);

  // Дни рождения
  const bdTasks = birthdayVirtualTasks(today);

  const section = document.createElement("section");
  section.className = "day today";

  const header = document.createElement("div");
  header.className = "day-header";
  const nameEl = document.createElement("span");
  nameEl.className = "day-name";
  nameEl.textContent = WEEKDAYS_FULL[(today.getDay() + 6) % 7];

  const meta = document.createElement("div");
  meta.className = "day-meta";
  const dateEl = document.createElement("span");
  dateEl.className = "day-date";
  dateEl.textContent = `${today.getDate()} ${MONTHS_GEN[today.getMonth()]}`;

  const status = scheduleStatusForDate(today);
  const tag = document.createElement("span");
  tag.className = "schedule-tag " + status;
  tag.textContent = status === "work" ? "раб" : "вых";

  meta.append(dateEl, tag);
  header.append(nameEl, meta);
  section.appendChild(header);

  const ul = document.createElement("ul");
  ul.className = "day-tasks";

  if (dayTasks.length === 0 && bdTasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "day-empty";
    empty.textContent = "На сегодня задач нет 🌸";
    ul.appendChild(empty);
  } else {
    bdTasks.forEach((t) => ul.appendChild(createBirthdayTaskEl(t, "day")));
    dayTasks.forEach((task) => ul.appendChild(createDayTaskEl(task)));
  }

  section.appendChild(ul);
  todayView.appendChild(section);
}

// ---------- Группировка задач ----------
// Собираем все задачи, попадающие на дату (включая повторы)
function tasksForDate(date) {
  const result = [];
  tasks.forEach((t) => {
    const v = virtualTaskForDate(t, date);
    if (v) result.push(v);
  });
  return result;
}

function groupByDay() {
  // Группируем по всем дням, которые есть в задачах, но реально
  // используется только в недельном/месячном рендере — там мы
  // запрашиваем задачи по каждой дате через tasksForDate.
  return {};
}

function birthdayVirtualTasks(date) {
  return birthdaysForDate(date).map((b) => {
    const age = ageInYear(b, date.getFullYear());
    return {
      id: "bd-" + b.id,
      birthdayId: b.id,
      text: `🎂 День рождения: ${b.name}` + (age !== null ? ` (${age})` : ""),
      isBirthday: true,
      comment: b.note || "",
      done: false,
      hasTime: false,
      deadline: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0).toISOString(),
    };
  });
}

// ---------- Недельный вид ----------
function renderWeek() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  weekList.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(weekStart, i);
    const key = dayKey(dayDate);
    const isToday = dayDate.getTime() === today.getTime();
    const isPast = dayDate.getTime() < today.getTime();
    const isWeekend = i >= 5;

    const dayEl = document.createElement("section");
    dayEl.className =
      "day" +
      (isToday ? " today" : "") +
      (isPast ? " past" : "") +
      (isWeekend ? " weekend" : "");
    dayEl.dataset.drop = "day";
    dayEl.dataset.date = key;
    setupDropzone(dayEl);

    const header = document.createElement("div");
    header.className = "day-header";
    const nameEl = document.createElement("span");
    nameEl.className = "day-name";
    nameEl.textContent = WEEKDAYS_FULL[i];

    const meta = document.createElement("div");
    meta.className = "day-meta";
    const dateEl = document.createElement("span");
    dateEl.className = "day-date";
    dateEl.textContent = `${dayDate.getDate()} ${MONTHS_GEN[dayDate.getMonth()]}`;

    const status = scheduleStatusForDate(dayDate);
    const tag = document.createElement("span");
    tag.className = "schedule-tag " + status;
    tag.textContent = status === "work" ? "раб" : "вых";

    meta.append(dateEl, tag);
    header.append(nameEl, meta);
    dayEl.appendChild(header);

    const ul = document.createElement("ul");
    ul.className = "day-tasks";

    const dayTasks = tasksForDate(dayDate);
    const bdTasks = birthdayVirtualTasks(dayDate);

    if (dayTasks.length === 0 && bdTasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "day-empty";
      empty.textContent = "нет задач";
      ul.appendChild(empty);
    } else {
      bdTasks.forEach((t) => ul.appendChild(createBirthdayTaskEl(t, "day")));
      dayTasks.forEach((task) => ul.appendChild(createDayTaskEl(task)));
    }

    dayEl.appendChild(ul);
    weekList.appendChild(dayEl);
  }
}

// ---------- Месячный вид ----------
function renderMonth() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const firstOfMonth = addMonths(today, monthOffset);
  const monthStart = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1);
  const gridStart = startOfWeek(monthStart);

  monthWeekdays.innerHTML = "";
  WEEKDAYS_SHORT.forEach((name, i) => {
    const el = document.createElement("div");
    el.textContent = name;
    if (i >= 5) el.classList.add("weekend");
    monthWeekdays.appendChild(el);
  });

  monthGrid.innerHTML = "";

  for (let i = 0; i < 42; i++) {
    const dayDate = addDays(gridStart, i);
    const key = dayKey(dayDate);
    const inMonth = dayDate.getMonth() === monthStart.getMonth();
    const isToday = dayDate.getTime() === today.getTime();
    const isPast = dayDate.getTime() < today.getTime();
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

    const cell = document.createElement("div");
    cell.className =
      "month-cell" +
      (inMonth ? "" : " other-month") +
      (isToday ? " today" : "") +
      (isPast ? " past" : "") +
      (isWeekend ? " weekend" : "");
    cell.dataset.drop = "day";
    cell.dataset.date = key;
    setupDropzone(cell);

    cell.addEventListener("click", (e) => {
      if (e.target.closest(".month-task")) return;
      dateInput.value = key;
      input.focus();
    });

    const cellHeader = document.createElement("div");
    cellHeader.className = "month-cell-header";
    const numEl = document.createElement("span");
    numEl.className = "month-cell-num";
    numEl.textContent = dayDate.getDate();

    const rightWrap = document.createElement("span");
    rightWrap.style.display = "flex";
    rightWrap.style.alignItems = "center";
    rightWrap.style.gap = "4px";

    const status = scheduleStatusForDate(dayDate);
    const sTag = document.createElement("span");
    sTag.className = "month-schedule-tag " + status;
    sTag.textContent = status === "work" ? "раб" : "вых";
    rightWrap.appendChild(sTag);

    const dayTasks = tasksForDate(dayDate);
    const bdTasks = birthdayVirtualTasks(dayDate);
    const totalCount = dayTasks.length + bdTasks.length;

    if (totalCount > 0) {
      const countEl = document.createElement("span");
      countEl.className = "month-cell-count";
      countEl.textContent = totalCount;
      rightWrap.appendChild(countEl);
    }

    cellHeader.append(numEl, rightWrap);
    cell.appendChild(cellHeader);

    const ul = document.createElement("ul");
    ul.className = "month-cell-tasks";
    bdTasks.slice(0, MONTH_MAX_TASKS).forEach((t) => ul.appendChild(createBirthdayTaskEl(t, "month")));

    const remaining = Math.max(0, MONTH_MAX_TASKS - bdTasks.length);
    const visibleTasks = dayTasks.slice(0, remaining);
    visibleTasks.forEach((task) => ul.appendChild(createMonthTaskEl(task)));

    const shownTotal = bdTasks.length + visibleTasks.length;
    if (totalCount > shownTotal) {
      const more = document.createElement("li");
      more.className = "month-more";
      more.textContent = `+ ещё ${totalCount - shownTotal}`;
      ul.appendChild(more);
    }

    cell.appendChild(ul);
    monthGrid.appendChild(cell);
  }
}

// ---------- Создание элементов ----------
function createDayTaskEl(task) {
  const overdue = isOverdue(task);
  const hasComment = Boolean(task.comment && task.comment.trim());
  const isRepeat = task.isRepeat;

  const li = document.createElement("li");
  li.className =
    "day-task" +
    (task.done ? " done" : "") +
    (overdue ? " overdue" : "") +
    (hasComment ? " has-comment" : "");
  li.dataset.id = task.id;
  if (task.originalId) li.dataset.originalId = task.originalId;

  setupDraggable(li, task.id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", "Отметить выполненной");
  checkbox.addEventListener("change", () => toggleVirtualTask(task));
  checkbox.addEventListener("pointerdown", (e) => e.stopPropagation());

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;
  if (isRepeat) {
    const rep = document.createElement("span");
    rep.className = "repeat-mark";
    rep.textContent = "↻";
    rep.title = REPEAT_LABELS[task.repeat] || "повтор";
    text.appendChild(rep);
  }

  const time = document.createElement("span");
  time.className = "task-time" + (!task.hasTime ? " day-only" : "");
  time.textContent = formatTime(task);

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete";
  del.textContent = "✕";
  del.setAttribute("aria-label", "Удалить задачу");
  del.addEventListener("click", () => deleteTask(task.originalId || task.id));
  del.addEventListener("pointerdown", (e) => e.stopPropagation());

  li.append(checkbox, text, time);

  if (hasComment) {
    const mark = document.createElement("span");
    mark.className = "task-has-comment";
    mark.textContent = "📝";
    mark.title = task.comment;
    li.appendChild(mark);
  }
  li.appendChild(del);
  return li;
}

function createMonthTaskEl(task) {
  const overdue = isOverdue(task);
  const hasComment = Boolean(task.comment && task.comment.trim());
  const isRepeat = task.isRepeat;

  const li = document.createElement("li");
  li.className =
    "month-task" +
    (task.done ? " done" : "") +
    (overdue ? " overdue" : "") +
    (hasComment ? " has-comment" : "");
  li.dataset.id = task.id;
  if (task.originalId) li.dataset.originalId = task.originalId;
  li.title =
    (isRepeat ? "↻ " : "") +
    (hasComment ? "📝 " : "") +
    `${formatTime(task)} — ${task.text}` +
    (hasComment ? `\n\n${task.comment}` : "");

  setupDraggable(li, task.id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", "Отметить выполненной");
  checkbox.addEventListener("change", () => toggleVirtualTask(task));
  checkbox.addEventListener("pointerdown", (e) => e.stopPropagation());

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const time = document.createElement("span");
  time.className = "task-time" + (!task.hasTime ? " day-only" : "");
  time.textContent = task.hasTime ? formatTime(task) : "день";

  li.append(checkbox, text, time);

  if (hasComment) {
    const mark = document.createElement("span");
    mark.className = "task-has-comment";
    mark.textContent = "📝";
    li.appendChild(mark);
  }
  if (isRepeat) {
    const rep = document.createElement("span");
    rep.className = "repeat-mark";
    rep.textContent = "↻";
    li.appendChild(rep);
  }
  return li;
}

function createBirthdayTaskEl(task, variant) {
  const isMonth = variant === "month";
  const li = document.createElement("li");
  li.className = (isMonth ? "month-task" : "day-task") + " birthday";
  li.dataset.id = task.id;
  li.dataset.birthdayId = task.birthdayId;
  li.title = task.comment ? `🎂 ${task.text}\n\n${task.comment}` : `🎂 ${task.text}`;
  li.addEventListener("click", (e) => {
    e.stopPropagation();
    openBirthdaysModal();
    setTimeout(() => highlightBdItem(task.birthdayId), 50);
  });

  const mark = document.createElement("span");
  mark.className = "task-text";
  mark.textContent = task.text;

  const time = document.createElement("span");
  time.className = "task-time day-only";
  time.textContent = isMonth ? "день" : "на день";

  li.append(mark, time);

  if (task.comment) {
    const c = document.createElement("span");
    c.className = "task-has-comment";
    c.textContent = "📝";
    c.title = task.comment;
    li.appendChild(c);
  }
  return li;
}

// ---------- Без даты ----------
function renderUnscheduled() {
  const unscheduled = tasks.filter((t) => !t.deadline);
  listUnscheduled.innerHTML = "";
  if (unscheduled.length === 0) {
    unscheduledSection.style.display = "none";
  } else {
    unscheduledSection.style.display = "block";
    unscheduled.forEach((task) => listUnscheduled.appendChild(createFullTaskEl(task)));
  }
}

function createFullTaskEl(task) {
  const hasComment = Boolean(task.comment && task.comment.trim());
  const li = document.createElement("li");
  li.className = "task-item" + (task.done ? " done" : "") + (hasComment ? " has-comment" : "");
  li.dataset.id = task.id;
  setupDraggable(li, task.id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", "Отметить выполненной");
  checkbox.addEventListener("change", () => toggleTask(task.id));
  checkbox.addEventListener("pointerdown", (e) => e.stopPropagation());

  const body = document.createElement("div");
  body.className = "task-body";

  const textEl = document.createElement("span");
  textEl.className = "task-text";
  textEl.textContent = task.text;
  if (hasComment) {
    const mark = document.createElement("span");
    mark.className = "task-has-comment";
    mark.textContent = "📝";
    textEl.appendChild(mark);
  }
  body.appendChild(textEl);

  if (hasComment) {
    const preview = document.createElement("span");
    preview.className = "task-comment-preview";
    preview.textContent = task.comment;
    body.appendChild(preview);
  }

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete";
  del.textContent = "✕";
  del.setAttribute("aria-label", "Удалить задачу");
  del.addEventListener("click", () => deleteTask(task.id));
  del.addEventListener("pointerdown", (e) => e.stopPropagation());

  li.append(checkbox, body, del);
  return li;
}

// ---------- Счётчик ----------
function updateCounter() {
  const activeCount = tasks.filter((t) => !t.done).length;
  counter.textContent = `${activeCount} из ${tasks.length} осталось`;
}

// ---------- Действия с задачами ----------
function addTask(text, dateStr, timeStr, hasTime) {
  const deadline = makeDeadlineFromInputs(dateStr, timeStr, hasTime);
  tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    deadline,
    hasTime: deadline ? hasTime : false,
    comment: "",
    repeat: "none",
    doneOn: [],
    done: false,
    createdAt: new Date().toISOString(),
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const t = tasks.find((t) => t.id === id);
  if (t) { t.done = !t.done; saveTasks(); render(); }
}

// Переключение для виртуальной копии
function toggleVirtualTask(task) {
  const original = tasks.find((t) => t.id === (task.originalId || task.id));
  if (!original) return;

  if (task.isRepeat) {
    const date = new Date(task.deadline);
    setTaskDoneOn(original, date, !task.done);
  } else {
    original.done = !original.done;
  }
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
  if (editingId === id) closeEditor();
}

function moveTask(id, dropData) {
  // id может быть виртуальным — берём оригинал
  const realId = id.includes("@") ? id.split("@")[0] : id;
  const t = tasks.find((t) => t.id === realId);
  if (!t) return;

  if (dropData === "unscheduled") {
    t.deadline = null;
    t.hasTime = false;
    t.repeat = "none";
  } else if (dropData && dropData.date) {
    const [y, m, d] = dropData.date.split("-").map(Number);
    t.deadline = makeDeadlineForMove(new Date(y, m - 1, d), t);
  } else return;

  saveTasks();
  render();
}

// ---------- Редактор задачи ----------
function openEditor(id) {
  const realId = id.includes("@") ? id.split("@")[0] : id;
  const t = tasks.find((t) => t.id === realId);
  if (!t) return;

  editingId = realId;
  editText.value = t.text;
  editDate.value = isoToDateStr(t.deadline);
  editTime.value = t.hasTime ? isoToTimeStr(t.deadline) : "";
  editNoTime.checked = !t.hasTime;
  editRepeat.value = t.repeat || "none";
  editComment.value = t.comment || "";

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => editText.focus(), 30);
}

function closeEditor() {
  modal.hidden = true;
  document.body.style.overflow = "";
  editingId = null;
}

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!editingId) return;
  const t = tasks.find((t) => t.id === editingId);
  if (!t) return;

  const text = editText.value.trim();
  if (!text) return;

  const dateStr = editDate.value || "";
  const hasTime = !editNoTime.checked && Boolean(editTime.value);
  const timeStr = hasTime ? editTime.value : "";

  t.text = text;
  t.deadline = makeDeadlineFromInputs(dateStr, timeStr, hasTime);
  t.hasTime = t.deadline ? hasTime : false;
  t.repeat = editRepeat.value || "none";
  t.comment = editComment.value.trim();

  saveTasks();
  render();
  closeEditor();
});

editCancel.addEventListener("click", closeEditor);
modalClose.addEventListener("click", closeEditor);
editDelete.addEventListener("click", () => {
  if (!editingId) return;
  if (confirm("Удалить задачу?")) deleteTask(editingId);
});
modal.addEventListener("click", (e) => { if (e.target === modal) closeEditor(); });
editNoTime.addEventListener("change", () => { if (editNoTime.checked) editTime.value = ""; });

// ---------- Модалка дней рождения ----------
function openBirthdaysModal() {
  bdModal.hidden = false;
  document.body.style.overflow = "hidden";
  renderBdList();
  setTimeout(() => bdName.focus(), 30);
}
function closeBirthdaysModal() {
  bdModal.hidden = true;
  document.body.style.overflow = "";
  resetBdForm();
}
birthdaysBtn.addEventListener("click", openBirthdaysModal);
bdModalClose.addEventListener("click", closeBirthdaysModal);
bdModal.addEventListener("click", (e) => { if (e.target === bdModal) closeBirthdaysModal(); });

function resetBdForm() {
  bdForm.reset();
  editingBdId = null;
  bdSubmit.textContent = "Добавить";
  bdCancelEdit.hidden = true;
}
bdCancelEdit.addEventListener("click", resetBdForm);

bdForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = bdName.value.trim();
  const date = bdDate.value;
  const note = bdNote.value.trim();
  if (!name || !date) return;

  if (editingBdId) {
    const b = birthdays.find((x) => x.id === editingBdId);
    if (b) { b.name = name; b.date = date; b.note = note; }
  } else {
    birthdays.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name, date, note,
    });
  }
  saveBirthdays();
  resetBdForm();
  renderBdList();
  render();
  updateBirthdayBanner(new Date());
});

function renderBdList() {
  bdList.innerHTML = "";
  if (birthdays.length === 0) {
    const empty = document.createElement("li");
    empty.className = "bd-empty";
    empty.textContent = "Пока никого нет — добавьте первого 🎂";
    bdList.appendChild(empty);
    return;
  }

  const now = new Date();
  const todayMd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const sorted = [...birthdays].sort((a, b) => {
    const aMd = bdMonthDay(a);
    const bMd = bdMonthDay(b);
    const aDiff = (parseInt(aMd.replace("-", ""), 10) - parseInt(todayMd.replace("-", ""), 10) + 10000) % 10000;
    const bDiff = (parseInt(bMd.replace("-", ""), 10) - parseInt(todayMd.replace("-", ""), 10) + 10000) % 10000;
    return aDiff - bDiff;
  });

  sorted.forEach((b) => {
    const md = bdMonthDay(b);
    const isToday = md === todayMd;

    const li = document.createElement("li");
    li.className = "bd-item" + (isToday ? " today" : "");
    li.dataset.bdId = b.id;

    const dateEl = document.createElement("span");
    dateEl.className = "bd-item-date";
    const [, mm, dd] = b.date.split("-");
    dateEl.textContent = `${dd}.${mm}`;

    const body = document.createElement("div");
    body.className = "bd-item-body";
    const nameEl = document.createElement("span");
    nameEl.className = "bd-item-name";
    nameEl.textContent = b.name + (isToday ? " 🎉" : "");
    const meta = document.createElement("span");
    meta.className = "bd-item-age";
    const age = ageInYear(b, now.getFullYear());
    meta.textContent = age !== null ? `${age} лет` : "";
    body.append(nameEl, meta);

    if (b.note) {
      const note = document.createElement("span");
      note.className = "bd-item-note";
      note.textContent = b.note;
      body.appendChild(note);
    }

    const actions = document.createElement("div");
    actions.className = "bd-item-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.title = "Редактировать";
    editBtn.textContent = "✎";
    editBtn.addEventListener("click", () => startEditBd(b.id));

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.title = "Удалить";
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", () => {
      if (!confirm(`Удалить «${b.name}»?`)) return;
      birthdays = birthdays.filter((x) => x.id !== b.id);
      saveBirthdays();
      renderBdList();
      render();
      updateBirthdayBanner(new Date());
    });

    actions.append(editBtn, delBtn);
    li.append(dateEl, body, actions);
    bdList.appendChild(li);
  });
}

function startEditBd(id) {
  const b = birthdays.find((x) => x.id === id);
  if (!b) return;
  editingBdId = id;
  bdName.value = b.name;
  bdDate.value = b.date;
  bdNote.value = b.note || "";
  bdSubmit.textContent = "Сохранить";
  bdCancelEdit.hidden = false;
  setTimeout(() => bdName.focus(), 30);
}

function highlightBdItem(id) {
  const item = bdList.querySelector(`[data-bd-id="${id}"]`);
  if (!item) return;
  item.scrollIntoView({ block: "nearest", behavior: "smooth" });
  item.style.transition = "box-shadow 0.4s ease";
  item.style.boxShadow = "0 0 0 3px rgba(236, 157, 187, 0.55)";
  setTimeout(() => { item.style.boxShadow = ""; }, 1200);
}

// ---------- Статистика ----------
function openStatsModal() {
  statsModal.hidden = false;
  document.body.style.overflow = "hidden";
  renderStats();
}
function closeStatsModal() {
  statsModal.hidden = true;
  document.body.style.overflow = "";
}
statsBtn.addEventListener("click", openStatsModal);
statsClose.addEventListener("click", closeStatsModal);
statsModal.addEventListener("click", (e) => { if (e.target === statsModal) closeStatsModal(); });

statsButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    statsScope = btn.dataset.stats;
    statsButtons.forEach((b) => b.classList.toggle("active", b === btn));
    renderStats();
  });
});

function renderStats() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let start, end, label;

  if (statsScope === "week") {
    start = startOfWeek(today);
    end = addDays(start, 6);
    label = "Неделя";
  } else {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    label = "Месяц";
  }
  end.setHours(23, 59, 59, 999);

  const created = tasks.filter((t) => {
    const c = new Date(t.createdAt || t.deadline || Date.now());
    return c >= start && c <= end;
  });

  const totalCreated = created.length;

  // Выполненные — для обычных done, для повторов — по doneOn в диапазоне
  let doneCount = 0;
  tasks.forEach((t) => {
    if (t.repeat && t.repeat !== "none") {
      (t.doneOn || []).forEach((key) => {
        const [y, m, d] = key.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        if (dt >= start && dt <= end) doneCount += 1;
      });
    } else if (t.done) {
      const dl = new Date(t.deadline || t.createdAt || Date.now());
      if (dl >= start && dl <= end) doneCount += 1;
    }
  });

  // Просроченные — задачи с дедлайном в диапазоне, не выполненные
  let overdueCount = 0;
  tasks.forEach((t) => {
    if (!t.deadline) return;
    const dl = new Date(t.deadline);
    if (dl >= start && dl <= end && !t.done) {
      if (dl < new Date()) overdueCount += 1;
    }
  });

  const percent = totalCreated > 0 ? Math.round((doneCount / totalCreated) * 100) : 0;

  statsGrid.innerHTML = "";
  statsGrid.appendChild(statCard("Период", label));
  statsGrid.appendChild(statCard("Создано", totalCreated));
  statsGrid.appendChild(statCard("Выполнено", doneCount));
  statsGrid.appendChild(statCard("Просрочено", overdueCount));
  statsGrid.appendChild(statCard("Процент выполнения", percent + "%", true));
}

function statCard(label, value, wide = false) {
  const div = document.createElement("div");
  div.className = "stat-card" + (wide ? " wide" : "");
  const l = document.createElement("span");
  l.className = "stat-label";
  l.textContent = label;
  const v = document.createElement("span");
  v.className = "stat-value";
  v.textContent = value;
  div.append(l, v);
  return div;
}

// ---------- Настройки ----------
function openSettingsModal() {
  settingsModal.hidden = false;
  document.body.style.overflow = "hidden";
  fillSettingsInputs();
  fillScheduleInputs();
  renderSchedule();
}
function closeSettingsModal() {
  settingsModal.hidden = true;
  document.body.style.overflow = "";
}
settingsBtn.addEventListener("click", openSettingsModal);
settingsClose.addEventListener("click", closeSettingsModal);
settingsModal.addEventListener("click", (e) => { if (e.target === settingsModal) closeSettingsModal(); });

function fillSettingsInputs() {
  setWorkStart.value = settings.workStart;
  setWorkEnd.value = settings.workEnd;
  setCompact.checked = settings.compact;
}

setWorkStart.addEventListener("change", () => {
  settings.workStart = setWorkStart.value || "09:00";
  saveSettings();
  updateWorkdayTimer(new Date());
});
setWorkEnd.addEventListener("change", () => {
  settings.workEnd = setWorkEnd.value || "18:00";
  saveSettings();
  updateWorkdayTimer(new Date());
});
setCompact.addEventListener("change", () => {
  settings.compact = setCompact.checked;
  saveSettings();
  applyCompactMode();
});

function applyCompactMode() {
  const autoCompact = window.matchMedia("(max-width: 480px)").matches;
  const useCompact = settings.compact || autoCompact;
  document.body.classList.toggle("compact", useCompact);
}

window.addEventListener("resize", applyCompactMode);

// График
function fillScheduleInputs() {
  schedStart.value = schedule.startDate;
  schedWork.value = schedule.workDays;
  schedRest.value = schedule.restDays;
}
schedStart.addEventListener("change", () => {
  if (!schedStart.value) return;
  schedule.startDate = schedStart.value;
  saveSchedule();
  renderSchedule();
  render();
});
schedWork.addEventListener("change", () => {
  const v = Math.max(1, Math.min(15, Number(schedWork.value) || 2));
  schedule.workDays = v;
  schedWork.value = v;
  saveSchedule();
  renderSchedule();
  render();
});
schedRest.addEventListener("change", () => {
  const v = Math.max(1, Math.min(15, Number(schedRest.value) || 2));
  schedule.restDays = v;
  schedRest.value = v;
  saveSchedule();
  renderSchedule();
  render();
});
schedPrev.addEventListener("click", () => { schedMonthOffset -= 1; renderSchedule(); });
schedNext.addEventListener("click", () => { schedMonthOffset += 1; renderSchedule(); });
schedToday.addEventListener("click", () => { schedMonthOffset = 0; renderSchedule(); });

function renderSchedule() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const base = addMonths(today, schedMonthOffset);
  const monthStart = new Date(base.getFullYear(), base.getMonth(), 1);
  const gridStart = startOfWeek(monthStart);

  schedTitle.textContent = `${MONTHS_NOM[monthStart.getMonth()]} ${monthStart.getFullYear()}`;

  schedWeekdays.innerHTML = "";
  WEEKDAYS_SHORT.forEach((name, i) => {
    const el = document.createElement("div");
    el.textContent = name;
    if (i >= 5) el.classList.add("weekend");
    schedWeekdays.appendChild(el);
  });

  schedGrid.innerHTML = "";
  for (let i = 0; i < 42; i++) {
    const dayDate = addDays(gridStart, i);
    const inMonth = dayDate.getMonth() === monthStart.getMonth();
    const isToday = dayDate.getTime() === today.getTime();
    const status = scheduleStatusForDate(dayDate);

    const cell = document.createElement("div");
    cell.className =
      "sched-cell " + status +
      (inMonth ? "" : " other-month") +
      (isToday ? " today" : "");

    const numEl = document.createElement("div");
    numEl.className = "sched-cell-num";
    numEl.textContent = dayDate.getDate();

    const tagEl = document.createElement("div");
    tagEl.className = "sched-cell-tag";
    tagEl.textContent = status === "work" ? "работа" : "отдых";

    cell.append(numEl, tagEl);
    schedGrid.appendChild(cell);
  }
}

// ---------- Esc ----------
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!modal.hidden) closeEditor();
  if (!bdModal.hidden) closeBirthdaysModal();
  if (!statsModal.hidden) closeStatsModal();
  if (!settingsModal.hidden) closeSettingsModal();
});

// ---------- Drag & Drop ----------
let draggedId = null;

function setupDraggable(el, id) {
  if (el.classList.contains("birthday")) return;
  el.draggable = true;

  el.addEventListener("dragstart", (e) => {
    draggedId = id;
    el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  });
  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
    draggedId = null;
    document.querySelectorAll(".drop-target").forEach((n) => n.classList.remove("drop-target"));
  });
  el.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    startPointerDrag(el, id, e);
  });
}

function setupDropzone(el) {
  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    el.classList.add("drop-target");
  });
  el.addEventListener("dragleave", () => el.classList.remove("drop-target"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drop-target");
    const id = draggedId || e.dataTransfer.getData("text/plain");
    if (!id) return;
    if (el.dataset.drop === "unscheduled") moveTask(id, "unscheduled");
    else moveTask(id, { date: el.dataset.date });
  });
}

function startPointerDrag(el, id, startEvent) {
  if (el.classList.contains("birthday")) return;

  const startX = startEvent.clientX;
  const startY = startEvent.clientY;
  const threshold = 8;
  let started = false;
  let ghost = null;
  let currentTarget = null;

  const onMove = (e) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!started) {
      if (Math.hypot(dx, dy) < threshold) return;
      started = true;
      draggedId = id;
      el.classList.add("dragging");
      ghost = el.cloneNode(true);
      ghost.style.position = "fixed";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "9999";
      ghost.style.opacity = "0.85";
      ghost.style.width = el.offsetWidth + "px";
      ghost.style.transform = "rotate(-1deg)";
      document.body.appendChild(ghost);
    }

    ghost.style.left = e.clientX - el.offsetWidth / 2 + "px";
    ghost.style.top = e.clientY - 20 + "px";

    const under = document.elementFromPoint(e.clientX, e.clientY);
    const zone = under?.closest('[data-drop="day"], [data-drop="unscheduled"]');
    if (zone !== currentTarget) {
      currentTarget?.classList.remove("drop-target");
      currentTarget = zone || null;
      currentTarget?.classList.add("drop-target");
    }
    e.preventDefault();
  };

  const onUp = () => {
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointercancel", onUp);

    if (!started) { openEditor(id); return; }

    ghost?.remove();
    el.classList.remove("dragging");

    if (currentTarget) {
      currentTarget.classList.remove("drop-target");
      if (currentTarget.dataset.drop === "unscheduled") moveTask(id, "unscheduled");
      else moveTask(id, { date: currentTarget.dataset.date });
    }
    draggedId = null;
    currentTarget = null;
  };

  document.addEventListener("pointermove", onMove, { passive: false });
  document.addEventListener("pointerup", onUp);
  document.addEventListener("pointercancel", onUp);
}

// ---------- Форма добавления ----------
noTimeCheckbox.addEventListener("change", () => {
  if (noTimeCheckbox.checked) {
    timeRow.classList.add("hide-time");
    timeInput.value = "";
  } else {
    timeRow.classList.remove("hide-time");
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const dateStr = dateInput.value || "";
  const hasTime = !noTimeCheckbox.checked && Boolean(timeInput.value);
  const timeStr = hasTime ? timeInput.value : "";
  addTask(text, dateStr, timeStr, hasTime);
  input.value = "";
  dateInput.value = "";
  timeInput.value = "";
  noTimeCheckbox.checked = false;
  timeRow.classList.remove("hide-time");
  input.focus();
});

prevBtn.addEventListener("click", () => {
  if (currentView === "week") weekOffset -= 1;
  else if (currentView === "month") monthOffset -= 1;
  render();
});
nextBtn.addEventListener("click", () => {
  if (currentView === "week") weekOffset += 1;
  else if (currentView === "month") monthOffset += 1;
  render();
});
todayBtn.addEventListener("click", () => {
  weekOffset = 0;
  monthOffset = 0;
  render();
});

viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentView = btn.dataset.view;
    viewButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    render();
  });
});

setInterval(render, 60 * 1000);

// ---------- Старт ----------
applyCompactMode();
render();
ensureHolidaysForYear(new Date().getFullYear());
setInterval(() => {
  ensureHolidaysForYear(new Date().getFullYear());
}, 24 * 60 * 60 * 1000);

// ---------- PWA ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((err) => {
      console.warn("SW не зарегистрирован:", err);
    });
  });
}