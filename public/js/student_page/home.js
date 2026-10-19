// =================================================================
// STUDENT DASHBOARD (home.html)
// Uses the secure /home/... routes. The server decides who is logged in
// from the login cookie / token, not from a number saved in the browser.
// =================================================================

const LOGIN_PAGE = "/pages/login.html";

// Sends the saved token too (if there is one). The login cookie is sent automatically.
function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return token ? { ...extra, Authorization: "Bearer " + token } : extra;
}

function api(url, options = {}) {
  return fetch(url, { ...options, credentials: "include", headers: authHeaders(options.headers) });
}

let redirecting = false;
function goToLogin(message) {
  if (redirecting) return;
  redirecting = true;
  localStorage.removeItem("token");
  localStorage.removeItem("student_id");
  if (message) alert(message);
  window.location.href = LOGIN_PAGE;
}

// Makes text from the database safe to put inside HTML
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// "08:00" -> "8:00 AM"
function formatTime(time) {
  if (!time) return "";
  const [h, m] = String(time).split(":").map(Number);
  if (isNaN(h)) return String(time);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${ampm}`;
}

// ISO date -> "Sep 21, 2026"
function formatDate(iso) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Schedule_days codes: MWF / TTH / SAT
// Mon=M Tue=T Wed=W Thu=H Fri=F Sat=S  (TTH contains T for Tue and H for Thu)
const DAY_LETTERS = { 1: "M", 2: "T", 3: "W", 4: "H", 5: "F", 6: "S" };

function isToday(scheduleDays) {
  const letter = DAY_LETTERS[new Date().getDay()];
  if (!letter || !scheduleDays) return false;
  return String(scheduleDays).toUpperCase().includes(letter);
}

// Puts the student's photo inside an avatar circle
function showPhoto(container, photoUrl) {
  if (!container || !photoUrl) return;
  container.innerHTML = "";
  const img = document.createElement("img");
  img.src = photoUrl;
  img.alt = "Profile photo";
  img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;";
  container.appendChild(img);
}

// ---------------- Student info ----------------
async function loadStudent() {
  try {
    const response = await api("/home/dashboard");
    if (response.status === 401 || response.status === 403) {
      return goToLogin("Please log in to continue.");
    }
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);

    const { user } = await response.json();
    const firstName = user.First_name || "";
    const fullName = `${firstName} ${user.Last_name || ""}`.trim();

    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    const greetings = document.getElementById("greetings");
    if (greetings) greetings.textContent = `WELCOME BACK, ${(firstName || "STUDENT").toUpperCase()}!`;

    const headerName = document.getElementById("header_student_name");
    if (headerName) headerName.textContent = fullName || "Student Account";

    set("student_name", `<span>Name:</span> ${escapeHtml(fullName)}`);
    set("student_course", `<span>Course:</span> ${escapeHtml(user.Course)}`);
    set("student_id", `<span>ID:</span> ${escapeHtml(user.Id_number)}`);
    set("student_year_level", `<span>Year Level:</span> ${escapeHtml(user.Current_year_level)}`);

    if (user.Profile_photo) {
      showPhoto(document.querySelector(".header-avatar"), user.Profile_photo);
      showPhoto(document.querySelector(".welcome-header .avatar"), user.Profile_photo);
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    const headerName = document.getElementById("header_student_name");
    if (headerName) headerName.textContent = "Student Account";
  }
}

// ---------------- Enrolled subjects + today's schedule ----------------
async function loadEnrolledSubjects() {
  try {
    const response = await api("/home/subjects");
    if (response.status === 401 || response.status === 403) return goToLogin();
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);

    const data = await response.json();
    const subjects = data.subjects || [];

    // 1. Subject cards
    const grid = document.getElementById("subjects_grid");
    if (grid) {
      if (subjects.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 16px;">
            No enrolled subjects yet.
          </div>`;
      } else {
        grid.innerHTML = subjects.map((s) => `
          <div class="subject-card">
            <h4><i class="fas fa-book"></i> ${escapeHtml(s.Subject_name)}</h4>
            <p>${escapeHtml(s.Subject_code)} (${escapeHtml(s.Edp_code)}) - ${escapeHtml(s.Instructor_name)}</p>
            <span>${escapeHtml(s.Schedule_days)} - ${formatTime(s.Start_time)} - ${formatTime(s.End_time)}<br>(${escapeHtml(s.Room)})</span>
          </div>
        `).join("");
      }
    }

    // 2. "My Classes" count
    const classCount = document.getElementById("class_count");
    if (classCount) classCount.textContent = subjects.length;

    // 3. Upcoming Schedule = only today's classes
    const schedule = document.getElementById("upcoming_schedule");
    if (schedule) {
      const todayClasses = subjects.filter((s) => isToday(s.Schedule_days));
      if (todayClasses.length === 0) {
        schedule.innerHTML = `
          <div class="schedule-item green">
            <div class="schedule-details">
              <h4>No classes today</h4>
              <p>Enjoy your day!</p>
            </div>
          </div>`;
      } else {
        const colors = ["green", "red", "orange"];
        schedule.innerHTML = todayClasses.map((s, i) => `
          <div class="schedule-item ${colors[i % colors.length]}">
            <div class="schedule-details">
              <h4>${escapeHtml(s.Subject_name)}</h4>
              <p>${formatTime(s.Start_time)} - ${formatTime(s.End_time)}</p>
            </div>
            <div class="schedule-room">${escapeHtml(s.Room)}</div>
          </div>
        `).join("");
      }
    }
  } catch (error) {
    console.error("Error loading enrolled subjects:", error);
  }
}

// ---------------- Announcements ----------------
async function loadAnnouncements() {
  try {
    const response = await api("/home/announcements");
    if (response.status === 401 || response.status === 403) return goToLogin();
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);

    const data = await response.json();
    const announcements = data.announcements || [];
    const list = document.getElementById("announcements_list");
    if (!list) return;

    if (announcements.length === 0) {
      list.innerHTML = `
        <div class="announcement-item">
          <h4>No announcements yet</h4>
          <p>Check back later.</p>
        </div>`;
      return;
    }

    list.innerHTML = announcements.map((a) => `
      <div class="announcement-item">
        <h4>${escapeHtml(a.Announcement_title)}</h4>
        <p>${formatDate(a.Announcement_date)}</p>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error loading announcements:", error);
  }
}

// ---------------- Logout ----------------
async function logout() {
  try {
    await fetch("/auth/logout", { method: "POST", credentials: "include" });
  } catch (error) {
    console.error("Error during logout:", error);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("student_id");
  localStorage.removeItem("role");
  window.location.href = LOGIN_PAGE;
}

document.addEventListener("DOMContentLoaded", () => {
  ["logoutBtn", "headerLogoutBtn"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", logout);
  });

  loadStudent();
  loadEnrolledSubjects();
  loadAnnouncements();
});
