const state = {
  view: "home",
  category: "All",
  search: "",
  announcements: [],
  events: [],
  calendarDate: new Date(),
};

const CATEGORY_COLORS = {
  Important: "#d64545",
  Event: "#1f9d55",
  Scholarship: "#b8860b",
  General: "#6c4fd6",
  Academic: "#d64545",
  Holiday: "#d97a1f",
};

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const hamburgerBtn = document.getElementById("hamburgerBtn");

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("open");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("open");
}
hamburgerBtn.addEventListener("click", openSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

async function loadUser() {
  try {
    const res = await fetch("/home/dashboard", { credentials: "include" });
    if (res.status === 401 || res.status === 403) {
      window.location.href = "/index.html";
      return;
    }
    const data = await res.json();
    const name = data.user ? `${data.user.First_name} ${data.user.Last_name}` : "Student";
    document.getElementById("userName").textContent = name;
  } catch (err) {
    console.error("Failed to load user:", err);
    document.getElementById("userName").textContent = "Student";
  }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("/auth/logout", { method: "POST", credentials: "include" });
    if (res.ok) {
      window.location.href = "/index.html";
    } else {
      alert("Logout failed. Please try again.");
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("Network error during logout.");
  }
});

async function loadAnnouncements() {
  const listEl = document.getElementById("announcementList");
  listEl.innerHTML = `<p class="state-text">Loading announcements...</p>`;

  try {
    const res = await fetch("/announcements", { credentials: "include" });
    if (res.status === 401 || res.status === 403) {
      window.location.href = "/index.html";
      return;
    }
    const data = await res.json();
    state.announcements = data.announcements || [];
    renderAnnouncements();
  } catch (err) {
    console.error("Failed to load announcements:", err);
    listEl.innerHTML = `<p class="state-text">Couldn't load announcements. Please try again.</p>`;
  }
}

function renderAnnouncements() {
  const listEl = document.getElementById("announcementList");
  let items = [...state.announcements];

  if (state.view === "all" && state.category !== "All") {
    items = items.filter((a) => a.category === state.category);
  }

  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    items = items.filter(
      (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );
  }

  if (state.view === "home") {
    items = items.slice(0, 4);
  }

  if (items.length === 0) {
    listEl.innerHTML = `<p class="state-text">No announcements found.</p>`;
    return;
  }

  listEl.innerHTML = items.map(renderAnnouncementCard).join("");

  listEl.querySelectorAll("[data-read-more]").forEach((btn) => {
    btn.addEventListener("click", () => openDetailModal(btn.dataset.readMore));
  });
}

function renderAnnouncementCard(a) {
  const tags = [`<span class="tag tag-${a.category}">${a.category}</span>`];
  if (a.pinned) tags.push(`<span class="tag tag-Pinned">📌 Pinned</span>`);

  return `
    <div class="announcement-card">
      <div class="card-top">
        <div class="card-tags">${tags.join("")}</div>
        <span class="card-date">${formatDate(a.created_at)}</span>
      </div>
      <h3>${escapeHtml(a.title)}</h3>
      <p>${escapeHtml(truncate(a.content, 160))}</p>
      <div class="card-bottom">
        <span class="card-author">
          <svg viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5Z"/></svg>
          ${escapeHtml(a.posted_by_label || "Student Portal")}
        </span>
        <button class="read-more" data-read-more="${a.announcement_id}">Read more</button>
      </div>
    </div>
  `;
}

const detailOverlay = document.getElementById("detailModalOverlay");

async function openDetailModal(id) {
  const local = state.announcements.find((a) => String(a.announcement_id) === String(id));
  if (!local) return;

  document.getElementById("modalTag").textContent = local.category;
  document.getElementById("modalTag").className = `tag tag-${local.category}`;
  document.getElementById("modalDate").textContent = formatDate(local.created_at);
  document.getElementById("modalTitle").textContent = local.title;
  document.getElementById("modalAuthor").textContent = local.posted_by_label || "Student Portal";
  document.getElementById("modalBody").textContent = local.content;

  detailOverlay.classList.add("open");
}

function closeDetailModal() {
  detailOverlay.classList.remove("open");
}
document.getElementById("detailModalClose").addEventListener("click", closeDetailModal);
document.getElementById("modalDoneBtn").addEventListener("click", closeDetailModal);
detailOverlay.addEventListener("click", (e) => {
  if (e.target === detailOverlay) closeDetailModal();
});

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const filterTabs = document.getElementById("filterTabs");
const viewAllBtn = document.getElementById("viewAllBtn");
const navAnnouncements = document.getElementById("navAnnouncements");

function switchToAllView() {
  state.view = "all";
  pageTitle.textContent = "View ALL Announcements";
  pageSubtitle.textContent = "Browse all announcements, events and important updates";
  filterTabs.hidden = false;
  viewAllBtn.textContent = "Back to Overview";
  renderAnnouncements();
}

function switchToHomeView() {
  state.view = "home";
  state.category = "All";
  pageTitle.textContent = "Announcements & Events";
  pageSubtitle.textContent = "Stay updated with school-wide notices, deadlines, and upcoming activities";
  filterTabs.hidden = true;
  viewAllBtn.textContent = "View All";
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelector('.tab[data-filter="All"]').classList.add("active");
  renderAnnouncements();
}

viewAllBtn.addEventListener("click", () => {
  state.view === "home" ? switchToAllView() : switchToHomeView();
});

navAnnouncements.addEventListener("click", (e) => {
  e.preventDefault();
  closeSidebar();
  switchToHomeView();
});

filterTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  state.category = btn.dataset.filter;
  renderAnnouncements();
});

const searchInput = document.getElementById("searchInput");
let searchDebounce;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.search = e.target.value;
    if (state.search.trim() && state.view === "home") switchToAllView();
    else renderAnnouncements();
  }, 250);
});

document.getElementById("categoryBtn").addEventListener("click", () => {
  if (state.view === "home") switchToAllView();
});

const postOverlay = document.getElementById("postModalOverlay");
document.getElementById("postNoticeBtn").addEventListener("click", () => {
  postOverlay.classList.add("open");
});
document.getElementById("postModalClose").addEventListener("click", () => {
  postOverlay.classList.remove("open");
});
postOverlay.addEventListener("click", (e) => {
  if (e.target === postOverlay) postOverlay.classList.remove("open");
});

document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("postMessage");
  msgEl.textContent = "";
  msgEl.className = "form-message";

  const payload = {
    title: document.getElementById("postTitle").value.trim(),
    category: document.getElementById("postCategory").value,
    pinned: document.getElementById("postPinned").checked,
    content: document.getElementById("postContent").value.trim(),
  };

  try {
    const res = await fetch("/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      msgEl.textContent = data.error || "Something went wrong.";
      msgEl.classList.add("error");
      return;
    }

    msgEl.textContent = "Notice posted!";
    msgEl.classList.add("success");
    document.getElementById("postForm").reset();
    setTimeout(() => {
      postOverlay.classList.remove("open");
      msgEl.textContent = "";
    }, 900);
    loadAnnouncements();
  } catch (err) {
    console.error("Failed to post notice:", err);
    msgEl.textContent = "Network error. Please try again.";
    msgEl.classList.add("error");
  }
});

async function loadEvents() {
  const listEl = document.getElementById("eventList");
  try {
    const res = await fetch("/events", { credentials: "include" });
    if (res.status === 401 || res.status === 403) return;
    const data = await res.json();
    state.events = data.events || [];
    renderCalendar();
    renderUpcomingEvents();
  } catch (err) {
    console.error("Failed to load events:", err);
    listEl.innerHTML = `<p class="state-text light">Couldn't load events.</p>`;
  }
}

function renderUpcomingEvents() {
  const listEl = document.getElementById("eventList");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = state.events
    .filter((ev) => new Date(ev.event_date) >= today)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 4);

  if (upcoming.length === 0) {
    listEl.innerHTML = `<p class="state-text light">No upcoming events.</p>`;
    return;
  }

  listEl.innerHTML = upcoming.map(renderEventCard).join("");
}

function renderEventCard(ev) {
  const d = new Date(ev.event_date);
  const day = d.getDate();
  const month = d.toLocaleString(undefined, { month: "short" }).toUpperCase();
  const color = CATEGORY_COLORS[ev.category] || "#6c4fd6";
  const timeLabel = ev.all_day
    ? "All Day"
    : `${ev.start_time || ""}${ev.end_time ? " - " + ev.end_time : ""}`;

  return `
    <div class="event-card">
      <div class="event-date-box" style="background:${color}">
        <span class="day-num">${day}</span>
        <span>${month}</span>
      </div>
      <div class="event-info">
        <div class="event-info-top">
          <h4>${escapeHtml(ev.title)}</h4>
          <span class="tag tag-${ev.category}">${ev.category}</span>
        </div>
        <div class="event-meta">
          <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 10.59 4 4-1.41 1.41L11 13V6h2Z"/></svg>
          ${escapeHtml(timeLabel)}
        </div>
        ${ev.location ? `<div class="event-meta">
          <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z"/></svg>
          ${escapeHtml(ev.location)}
        </div>` : ""}
      </div>
    </div>
  `;
}

function renderCalendar() {
  const cal = state.calendarDate;
  const year = cal.getFullYear();
  const month = cal.getMonth();

  document.getElementById("calendarMonthLabel").textContent = cal.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventDays = new Set(
    state.events
      .filter((ev) => {
        const d = new Date(ev.event_date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((ev) => new Date(ev.event_date).getDate())
  );

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  let html = "";
  for (let i = 0; i < firstDay; i++) {
    html += `<span class="calendar-day empty"></span>`;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const classes = ["calendar-day"];
    if (isCurrentMonth && today.getDate() === day) classes.push("today");
    if (eventDays.has(day)) classes.push("has-event");
    html += `<span class="${classes.join(" ")}">${day}</span>`;
  }

  document.getElementById("calendarDays").innerHTML = html;
}

document.getElementById("prevMonth").addEventListener("click", () => {
  state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
  renderCalendar();
});
document.getElementById("nextMonth").addEventListener("click", () => {
  state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
  renderCalendar();
});
document.getElementById("viewAllEventsBtn").addEventListener("click", () => {
  alert("Build a dedicated /events page the same way as announcements once you're ready — this button is a placeholder for that link.");
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function truncate(str, len) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len).trim() + "..." : str;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

loadUser();
loadAnnouncements();
loadEvents();