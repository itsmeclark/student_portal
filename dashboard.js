(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const readStore = (key, fallback = []) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const sidebar = $("sidebar");
  const overlay = $("overlay");
  const ddBtn = $("ddBtn");
  const ddMenu = $("ddMenu");
  const modalEl = $("modal");
  const mTitle = $("mTitle");
  const mBody = $("mBody");
  const mCancel = $("mCancel");
  const mSave = $("mSave");
  let toastTimer = null;

  const students = readStore("cec_students", []);
  const grades = readStore("cec_grades", []);
  const announcements = readStore("cec_announcements", []);
  const profile = readStore("cec_profile", {
    name: "Gemar Enopia", email: "admin@cec.edu.ph",
    dept: "Information Technology / Admin"
  });

  const departments = ["HM", "TM", "CRIM", "IT", "BSED", "BEED"];
  const departmentNames = {
    HM: "Hospitality Management", TM: "Tourism Management",
    CRIM: "Criminology", IT: "Information Technology",
    BSED: "Secondary Education", BEED: "Elementary Education"
  };

  function showToast(message) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function closeSidebar() {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("show");
  }
  function openSidebar() {
    sidebar?.classList.add("open");
    overlay?.classList.add("show");
  }
  function closeDropdown() {
    ddMenu?.classList.add("hidden");
    ddBtn?.setAttribute("aria-expanded", "false");
  }

  const pageViews = {
    students: { title: "Student Records", html: () => `
      <h2>👥 Student Records</h2>
      <div class="box">
        <p>Manage student accounts added through Quick Actions.</p>
        <button class="btn" data-modal="Add Student">+ Add Student</button>
      </div>
      <div class="tablebox"><table id="studentTable">
        <thead><tr><th>Student ID</th><th>Full Name</th><th>Department</th><th>Action</th></tr></thead>
        <tbody>${students.length ? students.map((s, i) => `<tr><td>${escapeHtml(s.id)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.dept)}</td><td><button class="btn ghost" data-delete-student="${i}">Delete</button></td></tr>`).join("") : `<tr><td colspan="4">No student accounts yet. Click “Add Student” to create one.</td></tr>`}</tbody>
      </table></div>` },
    announcements: { title: "Announcements & Events", html: () => `
      <h2>📢 Announcements &amp; Events</h2>
      <div class="box"><button class="btn" data-modal="Post Announcement">+ Post Announcement</button></div>
      ${announcements.map(a => `<div class="box"><h4>${escapeHtml(a.title)}</h4><p>${escapeHtml(a.body || "")}</p><small>${escapeHtml(a.date)} · ${escapeHtml(a.category)}</small></div>`).join("")}
      <div class="box"><h4>Class Suspension – Tropical Cyclone Warning</h4><p>All in-person classes are suspended for Sept 2 due to the current weather advisory.</p><small>September 1, 2026 · Atalaya Publication · IMPORTANT</small></div>
      <div class="box"><h4>Dragon Week Opening Ceremony</h4><p>Lion dance, cultural presentations, and college band performance.</p><small>January 18, 2026 · Student Affairs Office · Event</small></div>
      <div class="box"><h4>CHED Scholarship Applications for 2nd Semester</h4><p>TES and Merit Scholarship applicants for AY 2025–2026 are now open for submission.</p><small>October 20, 2026 · Scholarship Office · Scholarship</small></div>` },
    schedule: { title: "Class Schedule", html: () => `
      <h2>📅 Class Schedule</h2><div class="tablebox"><table><thead><tr><th>Time</th><th>Subject</th><th>Day</th><th>Room</th><th>Instructor</th></tr></thead><tbody>
      <tr><td>7:30–9:00 AM</td><td>IT 301 – Web Systems</td><td>Mon / Wed</td><td>Lab 2</td><td>Prof. Reyes</td></tr>
      <tr><td>9:00–10:30 AM</td><td>MATH 201 – Discrete Math</td><td>Tue / Thu</td><td>Rm 204</td><td>Prof. Dela Cruz</td></tr>
      <tr><td>1:00–2:30 PM</td><td>ENG 102 – Technical Writing</td><td>Mon / Wed</td><td>Rm 110</td><td>Prof. Santos</td></tr>
      <tr><td>2:30–4:00 PM</td><td>IT 305 – Database Systems</td><td>Tue / Thu</td><td>Lab 1</td><td>Prof. Lim</td></tr>
      <tr><td>8:00–11:00 AM</td><td>PE 4 – Team Sports</td><td>Fri</td><td>Gym</td><td>Coach Ramos</td></tr>
      </tbody></table></div>` },
    grades: { title: "Grades & Records", html: () => `
      <h2>📄 Grades &amp; Records</h2>
      <div class="box"><button class="btn" data-modal="Upload Grades">+ Add Grade Record</button><p>Uploaded file names and subject details are stored in this demo. CSV contents are read locally.</p></div>
      <div class="tablebox"><table><thead><tr><th>Subject</th><th>Semester</th><th>File</th><th>Date Added</th></tr></thead><tbody>
      ${grades.length ? grades.map(g => `<tr><td>${escapeHtml(g.subject)}</td><td>${escapeHtml(g.semester)}</td><td>${escapeHtml(g.file || "No file")}</td><td>${escapeHtml(g.date)}</td></tr>`).join("") : `<tr><td colspan="4">No grade records added yet.</td></tr>`}
      </tbody></table></div>` },
    tuition: { title: "Tuition Assessment", html: () => `
      <h2>💳 Tuition Assessment</h2><div class="tablebox"><table><thead><tr><th>Description</th><th>Amount (PHP)</th></tr></thead><tbody>
      <tr><td>Tuition Fee (21 units @ 1,000.00/unit)</td><td>21,000.00</td></tr><tr><td>Laboratory Fees</td><td>3,500.00</td></tr><tr><td>Library &amp; Registration Fee</td><td>1,800.00</td></tr><tr><td>Miscellaneous &amp; Student Activities</td><td>2,200.00</td></tr><tr><td><b>Total Assessment</b></td><td><b>28,500.00</b></td></tr><tr><td>Total Payments Made</td><td>20,000.00</td></tr><tr><td><b>Remaining Balance</b></td><td><b style="color:#d92424">8,500.00</b></td></tr></tbody></table></div>` },
    profile: { title: "Profile Management", html: () => `
      <h2>👤 Profile Management</h2><div class="box"><form id="profileForm" style="display:grid;gap:12px;max-width:440px">
      <label>Full Name<input type="text" id="profName" value="${escapeAttr(profile.name)}" required></label>
      <label>Role<input type="text" value="System Administrator" disabled style="background:#e9edf5;color:#555"></label>
      <label>Email Address<input type="email" id="profEmail" value="${escapeAttr(profile.email)}" required></label>
      <label>Department<input type="text" id="profDept" value="${escapeAttr(profile.dept)}" required></label>
      <button type="submit" class="btn" style="justify-self:start">Save Profile</button></form></div>` },
    about: { title: "About", html: () => `<h2>About Cebu Eastern College</h2><div class="box"><h4>Institution Profile</h4><p>Cebu Eastern College is an educational institution located in Cebu City, Philippines, dedicated to providing quality and affordable education.</p></div><div class="box"><h4>Vision &amp; Mission</h4><p><b>Vision:</b> A community of learners empowered with wisdom, integrity, and social responsibility.</p><p><b>Mission:</b> To develop competent individuals through holistic education and character building.</p></div>` },
    contact: { title: "Contact Information", html: () => `<h2>Contact Information</h2><div class="box"><h4>Campus Address</h4><p>Cebu Eastern College<br>Leon Kilat St. cor. Dimas-Alang St., Cebu City, 6000 Cebu, Philippines</p></div><div class="box"><h4>Directory</h4><p><b>Phone:</b> (032) 255-0453 / 253-4357</p><p><b>Email:</b> admin@cec.edu.ph</p><p><b>Office Hours:</b> Monday–Friday: 8:00 AM–5:00 PM</p></div>` }
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  }
  function escapeAttr(value) { return escapeHtml(value); }

  function showView(viewName) {
    const dashboard = $("v-dashboard"), page = $("v-page");
    if (!dashboard || !page) return;
    all("[data-view]").forEach(link => link.classList.toggle("active", link.dataset.view === viewName));
    if (viewName === "dashboard") {
      dashboard.classList.remove("hidden"); page.classList.add("hidden");
    } else {
      const data = pageViews[viewName];
      if (!data) return;
      dashboard.classList.add("hidden"); page.classList.remove("hidden");
      page.innerHTML = data.html();
    }
    closeSidebar(); closeDropdown();
    if (location.hash !== "#" + viewName) history.replaceState(null, "", "#" + viewName);
  }

  const modalTemplates = {
    "Add Student": `<label>Full Name</label><input id="mStudentName" required placeholder="e.g. Maria Santos"><label>Department</label><select id="mStudentDept">${departments.map(d => `<option value="${d}" ${d === "IT" ? "selected" : ""}>${d} - ${departmentNames[d]}</option>`).join("")}</select><label>Student ID Number</label><input id="mStudentID" required placeholder="e.g. 2026-0142">`,
    "Upload Grades": `<label>Subject Code &amp; Title</label><input id="mGradeSubject" required placeholder="e.g. IT 301 – Web Systems"><label>Academic Semester</label><select id="mGradeSem"><option>1st Semester AY 2026-2027</option><option selected>2nd Semester AY 2026-2026</option><option>Summer Term 2027</option></select><label>Grade Sheet (.CSV recommended)</label><input type="file" id="mGradeFile" accept=".csv,.xlsx,.xls"><small>CSV file names and contents can be read. Excel files are recorded by filename only.</small>`,
    "Post Announcement": `<label>Announcement Title</label><input id="mAnnTitle" required placeholder="e.g. Midterm Examination Schedule"><label>Category</label><select id="mAnnCat"><option>Important</option><option>Event</option><option>Scholarship</option><option>General</option></select><label>Content / Summary</label><textarea id="mAnnBody" required placeholder="Enter notice details..." style="width:100%;height:90px;padding:9px;border:1px solid #ccd;border-radius:8px"></textarea>`
  };

  function openModal(name) {
    if (!modalEl || !mTitle || !mBody) return;
    mTitle.textContent = name;
    mBody.innerHTML = modalTemplates[name] || "<p>Action unavailable.</p>";
    modalEl.classList.remove("hidden");
    mBody.querySelector("input,select,textarea")?.focus();
  }
  function closeModal() { modalEl?.classList.add("hidden"); }

  function saveModal() {
    const action = mTitle?.textContent;
    if (action === "Add Student") {
      const name = $("mStudentName")?.value.trim();
      const dept = $("mStudentDept")?.value;
      const id = $("mStudentID")?.value.trim();
      if (!name || !id) return showToast("Please complete the student name and ID.");
      if (students.some(s => s.id.toLowerCase() === id.toLowerCase())) return showToast("That student ID already exists.");
      students.push({ name, dept, id });
      writeStore("cec_students", students);
      closeModal(); showView("students"); showToast("Student account added.");
      return;
    }
    if (action === "Upload Grades") {
      const subject = $("mGradeSubject")?.value.trim();
      const semester = $("mGradeSem")?.value;
      const file = $("mGradeFile")?.files?.[0];
      if (!subject) return showToast("Please enter the subject code and title.");
      const record = { subject, semester, file: file?.name || "No file attached", date: new Date().toLocaleDateString() };
      grades.push(record); writeStore("cec_grades", grades);
      if (file && file.name.toLowerCase().endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = () => {
          writeStore("cec_last_csv_preview", String(reader.result).slice(0, 50000));
          showToast("Grade record saved. CSV content read locally.");
        };
        reader.readAsText(file);
      }
      closeModal(); showView("grades"); showToast("Grade record saved.");
      return;
    }
    if (action === "Post Announcement") {
      const title = $("mAnnTitle")?.value.trim();
      const category = $("mAnnCat")?.value;
      const body = $("mAnnBody")?.value.trim();
      if (!title || !body) return showToast("Please enter an announcement title and content.");
      announcements.unshift({ title, category, body, date: new Date().toLocaleDateString() });
      writeStore("cec_announcements", announcements);
      closeModal(); showView("announcements"); showToast("Announcement posted.");
      return;
    }
    closeModal();
  }

  $("burger")?.addEventListener("click", openSidebar);
  $("closeSide")?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);
  ddBtn?.addEventListener("click", e => {
    e.stopPropagation();
    const open = ddMenu?.classList.contains("hidden");
    ddMenu?.classList.toggle("hidden", !open);
    ddBtn?.setAttribute("aria-expanded", String(Boolean(open)));
  });
  document.addEventListener("click", e => {
    if (e.target.closest("[data-logout]")) { e.preventDefault(); logOut(); return; }
    if (e.target.closest("[data-view]")) {
      e.preventDefault(); showView(e.target.closest("[data-view]").dataset.view);
    }
    const modalButton = e.target.closest("[data-modal]");
    if (modalButton) openModal(modalButton.dataset.modal);
    const deleteButton = e.target.closest("[data-delete-student]");
    if (deleteButton) {
      const index = Number(deleteButton.dataset.deleteStudent);
      if (confirm("Delete this student record?")) {
        students.splice(index, 1); writeStore("cec_students", students);
        showView("students"); showToast("Student record deleted.");
      }
    }
    const stat = e.target.closest(".stat[data-dep]");
    if (stat) {
      all("#deptTable tbody tr").forEach(row => row.classList.toggle("hl", row.cells[0]?.textContent.trim().toUpperCase() === stat.dataset.dep.toUpperCase()));
      showToast("Highlighted department: " + stat.dataset.dep);
    }
  });
  function logOut() {
    if (!confirm("Are you sure you want to log out?")) return;
    closeModal(); closeSidebar(); closeDropdown();
    $("loggedout")?.classList.remove("hidden");
  }
  $("loginAgain")?.addEventListener("click", () => {
    $("loggedout")?.classList.add("hidden");
    showView("dashboard"); showToast("Welcome back, Admin!");
  });
  mCancel?.addEventListener("click", closeModal);
  mSave?.addEventListener("click", saveModal);
  modalEl?.addEventListener("click", e => { if (e.target === modalEl) closeModal(); });

  $("search")?.addEventListener("input", e => {
    const query = e.target.value.trim().toLowerCase();
    const rows = all("#deptTable tbody tr, #studentTable tbody tr");
    rows.forEach(row => {
      const match = query && row.textContent.toLowerCase().includes(query);
      row.classList.toggle("hl", Boolean(match));
      row.style.display = query && !match ? "none" : "";
    });
  });

  document.addEventListener("submit", e => {
    if (e.target.id === "profileForm") {
      e.preventDefault();
      profile.name = $("profName").value.trim();
      profile.email = $("profEmail").value.trim();
      profile.dept = $("profDept").value.trim();
      writeStore("cec_profile", profile);
      showToast("Profile changes saved.");
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(); closeSidebar(); closeDropdown(); }
  });
  window.addEventListener("hashchange", () => {
    const view = (location.hash || "#dashboard").slice(1);
    if (view === "dashboard" || pageViews[view]) showView(view);
  });

  // The portal opens directly without a login screen.
  const view = (location.hash || "#dashboard").slice(1);
  showView(pageViews[view] ? view : "dashboard");
})();