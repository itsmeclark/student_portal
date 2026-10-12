(() => {
  "use strict";

  const STORAGE_KEY = "cec_notices_v2";
  const CATEGORIES = ["Important", "Event", "Scholarship", "General"];
  const $ = id => document.getElementById(id);

  const defaults = () => [
    { id: 1, title: "Class Suspension - Tropical Cyclone Warning", summary: "All in-person classes are suspended for Sept 2 due to the current weather advisory.", category: "Important", dept: "Atalaya Publication", date: "September 1, 2026", status: "Published", pinned: true, content: "" },
    { id: 2, title: "Dragon Week Opening Ceremony", summary: "Lion dance, cultural presentations, and band performance.", category: "Event", dept: "Student Affairs Office", date: "January 18, 2026", status: "Published", pinned: false, content: "" },
    { id: 3, title: "CHED Scholarship Applications for 2nd Semester Now Accepting", summary: "TES and Merit Scholarship applicants for AY 2025-2026.", category: "Scholarship", dept: "Scholarship Office", date: "October 20, 2026", status: "Published", pinned: false, content: "" },
    { id: 4, title: "Library Hours Extended During Examination Period", summary: "The College Library will extend its operating hours during the final examination period.", category: "General", dept: "Library Services", date: "October 15, 2026", status: "Published", pinned: false, content: "" }
  ];

  const text = value => String(value ?? "");
  const normalizeNotice = (notice, index) => {
    if (!notice || typeof notice !== "object") return null;
    const category = CATEGORIES.includes(notice.category) ? notice.category : "General";
    const numericId = Number(notice.id);
    return {
      id: Number.isFinite(numericId) && numericId > 0 ? numericId : index + 1,
      title: text(notice.title),
      summary: text(notice.summary),
      category,
      dept: text(notice.dept) || "Student Affairs Office",
      date: text(notice.date),
      status: text(notice.status) || "Published",
      pinned: Boolean(notice.pinned),
      content: text(notice.content)
    };
  };

  let notices;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    notices = Array.isArray(stored) ? stored.map(normalizeNotice).filter(Boolean) : defaults();
  } catch (error) {
    notices = defaults();
  }

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
    } catch (error) {
      // The page remains usable when browser storage is unavailable.
    }
  };

  let nextId = notices.reduce((largest, notice) => Math.max(largest, notice.id), 0) + 1;
  let activeFilter = "All";
  let searchQuery = "";
  let editingId = null;
  let deletingId = null;
  let returnFocus = null;

  const rowsEl = $("rows");
  const emptyEl = $("empty");
  const icon = {
    edit: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 14h12M3 11.5l7.8-7.8 2 2L5 13.5H3z"/></svg>',
    star: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8l1.9 4 4.3.5-3.2 3 .9 4.3L8 11.4l-3.9 2.2.9-4.3-3.2-3 4.3-.5z"/></svg>',
    trash: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.5 7v4M9.5 7v4"/></svg>'
  };

  const escapeHTML = value => text(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function render() {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    const visibleNotices = notices
      .filter(notice => activeFilter === "All" || notice.category === activeFilter)
      .filter(notice => !normalizedQuery ||
        notice.title.toLocaleLowerCase().includes(normalizedQuery) ||
        notice.dept.toLocaleLowerCase().includes(normalizedQuery))
      .sort((first, second) => Number(second.pinned) - Number(first.pinned) || second.id - first.id);

    if (visibleNotices.length === 0) {
      rowsEl.innerHTML = "";
      emptyEl.hidden = false;
      $("restoreBtn").hidden = notices.length > 0;
    } else {
      emptyEl.hidden = true;
      rowsEl.innerHTML = visibleNotices.map(notice => {
        const categoryClass = notice.category.toLowerCase();
        return `
          <div class="row" data-id="${notice.id}">
            <div class="notice-cell">
              <div class="n-title">${escapeHTML(notice.title)}${notice.pinned ? '<span class="pin" title="Pinned" aria-label="Pinned">★</span>' : ""}</div>
              <div class="n-sum">${escapeHTML(notice.summary)}</div>
            </div>
            <div class="c category-cell" data-label="Category"><span class="tag ${categoryClass}">${escapeHTML(notice.category)}</span></div>
            <div class="dept" data-label="Department">${escapeHTML(notice.dept)}</div>
            <div class="date" data-label="Date posted">${escapeHTML(notice.date)}</div>
            <div class="status-cell" data-label="Status"><span class="status-badge">${escapeHTML(notice.status)}</span></div>
            <div class="actions" data-label="Actions">
              <button class="ib" type="button" data-act="edit" aria-label="Edit ${escapeHTML(notice.title)}">${icon.edit}</button>
              <button class="ib ${notice.pinned ? "on" : ""}" type="button" data-act="pin" aria-label="${notice.pinned ? "Unpin" : "Pin"} ${escapeHTML(notice.title)}" aria-pressed="${notice.pinned}">${icon.star}</button>
              <button class="ib danger" type="button" data-act="del" aria-label="Remove ${escapeHTML(notice.title)}">${icon.trash}</button>
            </div>
          </div>`;
      }).join("");
    }

    const activeCount = notices.filter(notice => notice.status === "Published").length;
    const pinnedCount = notices.filter(notice => notice.pinned).length;
    const draftCount = notices.filter(notice => notice.status === "Draft").length;
    $("statActive").textContent = activeCount;
    $("statPinned").textContent = pinnedCount;
    $("statDraft").textContent = draftCount;
  }

  const viewTitles = {
    dashboard: ["Dashboard", "Overview of the student portal"],
    students: ["Student Records", "Student record tools"],
    announcements: ["Announcements & Events / Admin", "Admin Panel / Announcements & Events"],
    schedule: ["Class Schedule", "Weekly classes for the current semester"],
    grades: ["Grades & Records", "Academic standing and final grades"],
    tuition: ["Tuition Assessment", "Fees for the current semester"],
    profile: ["Profile Management", "Update your account details"]
  };

  function showView(name) {
    if (!viewTitles[name] || !document.querySelector(`.view[data-view="${name}"]`)) return false;
    document.querySelectorAll(".view").forEach(view => {
      view.hidden = view.dataset.view !== name;
    });
    document.querySelectorAll("#mainNav .nav-item").forEach(link => {
      const isActive = link.dataset.view === name;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    $("pageTitle").textContent = viewTitles[name][0];
    $("pageCrumb").textContent = viewTitles[name][1];
    return true;
  }

  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = link.getAttribute("href").slice(1);
    if (!showView(target)) return;
    event.preventDefault();
    if (window.location.hash !== `#${target}`) window.location.hash = target;
  });

  window.addEventListener("hashchange", () => {
    const requestedView = window.location.hash.slice(1);
    if (!showView(requestedView)) showView("announcements");
  });

  const startingView = window.location.hash.slice(1);
  showView(viewTitles[startingView] ? startingView : "announcements");

  $("search").addEventListener("input", event => {
    searchQuery = event.target.value;
    render();
  });

  $("filters").addEventListener("click", event => {
    const button = event.target.closest("button[data-cat]");
    if (!button) return;
    activeFilter = button.dataset.cat;
    document.querySelectorAll("#filters .pill").forEach(pill => {
      const selected = pill === button;
      pill.classList.toggle("active", selected);
      pill.setAttribute("aria-pressed", String(selected));
    });
    render();
  });

  const openModal = (modalId, focusId) => {
    returnFocus = document.activeElement;
    $(modalId).hidden = false;
    if (focusId) $(focusId).focus();
  };
  const restoreFocus = () => {
    if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus();
    returnFocus = null;
  };
  const closeEditModal = () => {
    $("editModal").hidden = true;
    editingId = null;
    restoreFocus();
  };
  const closeDeleteModal = () => {
    $("deleteModal").hidden = true;
    deletingId = null;
    restoreFocus();
  };
  const closeLogoutModal = () => {
    $("logoutModal").hidden = true;
    restoreFocus();
  };

  rowsEl.addEventListener("click", event => {
    const button = event.target.closest("button[data-act]");
    if (!button) return;
    const row = button.closest(".row[data-id]");
    if (!row) return;
    const notice = notices.find(item => item.id === Number(row.dataset.id));
    if (!notice) return;

    if (button.dataset.act === "pin") {
      notice.pinned = !notice.pinned;
      save();
      render();
    } else if (button.dataset.act === "del") {
      deletingId = notice.id;
      openModal("deleteModal", "delCancel");
    } else if (button.dataset.act === "edit") {
      editingId = notice.id;
      $("editHeading").textContent = "Edit Announcement";
      $("fTitle").value = notice.title;
      $("fCat").value = notice.category;
      $("fDept").value = notice.dept;
      $("fImportant").checked = notice.category === "Important";
      $("fSummary").value = notice.summary;
      $("fContent").value = notice.content;
      $("formError").hidden = true;
      openModal("editModal", "fTitle");
    }
  });

  $("editClose").addEventListener("click", closeEditModal);
  $("editCancel").addEventListener("click", closeEditModal);

  $("postBtn").addEventListener("click", () => {
    editingId = null;
    $("editHeading").textContent = "Post Notice";
    $("fTitle").value = "";
    $("fCat").value = "General";
    $("fDept").value = "Student Affairs Office";
    $("fImportant").checked = false;
    $("fSummary").value = "";
    $("fContent").value = "";
    $("formError").hidden = true;
    openModal("editModal", "fTitle");
  });

  $("editForm").addEventListener("submit", event => {
    event.preventDefault();
    const title = $("fTitle").value.trim();
    const summary = $("fSummary").value.trim();
    if (!title || !summary) {
      $("formError").hidden = false;
      (!title ? $("fTitle") : $("fSummary")).focus();
      return;
    }

    const selectedCategory = $("fCat").value;
    const category = $("fImportant").checked ? "Important" : selectedCategory;
    const department = $("fDept").value.trim() || "Student Affairs Office";
    const content = $("fContent").value.trim();

    if (editingId !== null) {
      const notice = notices.find(item => item.id === editingId);
      if (notice) {
        notice.title = title;
        notice.summary = summary;
        notice.category = category;
        notice.dept = department;
        notice.content = content;
        if (category === "Important") notice.pinned = true;
      }
    } else {
      notices.unshift({
        id: nextId++, title, summary, category, dept: department,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        status: "Published", pinned: category === "Important", content
      });
    }

    save();
    render();
    closeEditModal();
  });

  $("delCancel").addEventListener("click", closeDeleteModal);
  $("delConfirm").addEventListener("click", () => {
    if (deletingId !== null) {
      notices = notices.filter(notice => notice.id !== deletingId);
      save();
      render();
    }
    closeDeleteModal();
  });

  $("restoreBtn").addEventListener("click", () => {
    notices = defaults();
    nextId = notices.length + 1;
    save();
    render();
  });

  $("logoutBtn").addEventListener("click", () => openModal("logoutModal", "logoutCancel"));
  $("logoutCancel").addEventListener("click", closeLogoutModal);
  $("logoutConfirm").addEventListener("click", () => {
    $("logoutModal").hidden = true;
    $("signedOut").hidden = false;
    $("loginAgain").focus();
    returnFocus = null;
  });
  $("loginAgain").addEventListener("click", () => {
    $("signedOut").hidden = true;
    $("logoutBtn").focus();
  });

  ["editModal", "deleteModal", "logoutModal", "signedOut"].forEach(id => {
    $(id).addEventListener("click", event => {
      if (event.target !== $(id)) return;
      if (id === "editModal") closeEditModal();
      if (id === "deleteModal") closeDeleteModal();
      if (id === "logoutModal") closeLogoutModal();
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!$("editModal").hidden) closeEditModal();
    else if (!$("deleteModal").hidden) closeDeleteModal();
    else if (!$("logoutModal").hidden) closeLogoutModal();
    else if (!$("signedOut").hidden) $("loginAgain").click();
  });

  render();
})();
