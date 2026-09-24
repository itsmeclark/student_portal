const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

let greetingsElement = document.getElementById("greetings");
let studentNameElement = document.getElementById("student_name");
let studentCourseElement = document.getElementById("student_course");
let studentIdElement = document.getElementById("student_id");
let studentYearLevelElement = document.getElementById("student_year_level");


// Function to open sidebar
menuToggle.addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("active");
});

// Function to close sidebar when clicking overlay
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
});

// Optional: Close sidebar when pressing the Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }
});
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      window.location.href = "../login.html"; // Redirect to login page after logout
    } else {
      alert("Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
});
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/home/dashboard", {
      credentials: "include",
    });

    if (!response.ok) {
      // 401/403 → not logged in, or 500 → server error
      if (response.status === 401 || response.status === 403) {
        window.location.href = "/pages/login.html";
        return;
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("User:", data);
    // render data.user on the page
    greetingsElement.textContent = `WELCOME BACK, ${data.user.First_name.toUpperCase()}!`;
    studentNameElement.innerHTML = `<span>Name:</span> ${data.user.First_name} ${data.user.Last_name}`;
    studentCourseElement.innerHTML = `<span>Course:</span> ${data.user.Course}`;
    studentIdElement.innerHTML = `<span>ID:</span> ${data.user.Id_number}`;
    studentYearLevelElement.innerHTML = `<span>Year Level:</span> ${data.user.Current_year_level}`;
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
});

// =================================================================
// ENROLLED SUBJECTS + TODAY'S SCHEDULE + ANNOUNCEMENTS (from DB)
// =================================================================

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

async function loadEnrolledSubjects() {
  try {
    const response = await fetch("/home/subjects", { credentials: "include" });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.location.href = "/pages/login.html";
        return;
      }
      throw new Error(`Request failed: ${response.status}`);
    }

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
        grid.innerHTML = subjects.map(subject => `
          <div class="subject-card">
            <h4><i class="fas fa-book"></i> ${subject.Subject_name}</h4>
            <p>${subject.Subject_code} (${subject.Edp_code}) - ${subject.Instructor_name}</p>
            <span>${subject.Schedule_days} - ${formatTime(subject.Start_time)} - ${formatTime(subject.End_time)}<br>(${subject.Room})</span>
          </div>
        `).join("");
      }
    }

    // 2. Hero "My Classes" count
    const classCount = document.getElementById("class_count");
    if (classCount) classCount.textContent = subjects.length;

    // 3. Upcoming Schedule = only today's classes
    const schedule = document.getElementById("upcoming_schedule");
    if (schedule) {
      const todayClasses = subjects.filter(subject => isToday(subject.Schedule_days));
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
        schedule.innerHTML = todayClasses.map((subject, index) => `
          <div class="schedule-item ${colors[index % colors.length]}">
            <div class="schedule-details">
              <h4>${subject.Subject_name}</h4>
              <p>${formatTime(subject.Start_time)} - ${formatTime(subject.End_time)}</p>
            </div>
            <div class="schedule-room">${subject.Room}</div>
          </div>
        `).join("");
      }
    }
  } catch (error) {
    console.error("Error loading enrolled subjects:", error);
  }
}

async function loadAnnouncements() {
  try {
    const response = await fetch("/home/announcements", { credentials: "include" });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.location.href = "/pages/login.html";
        return;
      }
      throw new Error(`Request failed: ${response.status}`);
    }

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

    list.innerHTML = announcements.map(announcement => `
      <div class="announcement-item">
        <h4>${announcement.Announcement_title}</h4>
        <p>${formatDate(announcement.Announcement_date)}</p>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error loading announcements:", error);
  }
}

loadEnrolledSubjects();
loadAnnouncements();
