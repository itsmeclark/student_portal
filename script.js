(() => {
  const defaults = () => [
    {id:1,title:"Class Suspension - Tropical Cyclone Warning",summary:"All in-person classes are suspended for Sept 2 due to the current weather advisory.",category:"Important",dept:"Atalaya Publication",date:"September 1, 2026",status:"Published",pinned:true,content:""},
    {id:2,title:"Dragon Week Opening Ceremony",summary:"Lion dance, cultural presentations , and band performance.",category:"Event",dept:"Student Affairs Office",date:"January 18, 2026",status:"Published",pinned:false,content:""},
    {id:3,title:"CHED Scholarship Applications for 2nd Semester Now Accepting",summary:"TES and Merit Scholarship applicants for AY 2025-2026.",category:"Scholarship",dept:"Scholarship Office",date:"October 20, 2026",status:"Published",pinned:false,content:""},
    {id:4,title:"Library Hours Extended During Examination Period",summary:"The College Library will extend its operating hours during the final examination period.",category:"General",dept:"Library Services",date:"October 15, 2026",status:"Published",pinned:false,content:""}
  ];
  const KEY = "cec_notices_v2";
  let notices;
  try { notices = JSON.parse(localStorage.getItem(KEY)); } catch (e) { notices = null; }
  if (!Array.isArray(notices)) notices = defaults();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(notices)); } catch (e) {} };
  let nextId = notices.reduce((m, n) => Math.max(m, n.id), 0) + 1, filter = "All", query = "", editingId = null, deletingId = null;
  const $ = id => document.getElementById(id);
  const rowsEl = $("rows"), emptyEl = $("empty");
  const IC = {
    edit:'<svg viewBox="0 0 16 16"><path d="M2 14h12M3 11.5l7.8-7.8 2 2L5 13.5H3z"/></svg>',
    star:'<svg viewBox="0 0 16 16"><path d="M8 1.8l1.9 4 4.3.5-3.2 3 .9 4.3L8 11.4l-3.9 2.2.9-4.3-3.2-3 4.3-.5z"/></svg>',
    trash:'<svg viewBox="0 0 16 16"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.5 7v4M9.5 7v4"/></svg>'
  };
  const esc = s => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));


  function render() {
    const q = query.trim().toLowerCase();
    const list = notices.filter(n =>
      (filter === "All" || n.category === filter) &&
      (!q || n.title.toLowerCase().includes(q) || n.dept.toLowerCase().includes(q))
    );
    list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.id - a.id);


    if (list.length === 0) {
      rowsEl.innerHTML = "";
      emptyEl.hidden = false;
      $("restoreBtn").hidden = (notices.length > 0);
    } else {
      emptyEl.hidden = true;
      rowsEl.innerHTML = list.map(n => `
        <div class="row" data-id="${n.id}">
          <div><div class="n-title">${esc(n.title)}${n.pinned ? '<span class="pin" title="Pinned">★</span>' : ''}</div><div class="n-sum">${esc(n.summary)}</div></div>
          <div class="c"><span class="tag ${esc(n.category)}">${esc(n.category).toUpperCase()}</span></div>
          <div class="dept">${esc(n.dept)}</div>
          <div class="date">${esc(n.date)}</div>
          <div class="status">${esc(n.status)}</div>
          <div class="actions">
            <button class="ib" data-act="edit" aria-label="Edit notice">${IC.edit}</button>
            <button class="ib ${n.pinned ? 'on' : ''}" data-act="pin" aria-label="Pin notice" aria-pressed="${n.pinned}">${IC.star}</button>
            <button class="ib" data-act="del" aria-label="Remove notice">${IC.trash}</button>
          </div>
        </div>
      `).join('');
    }


    const activeCount = notices.filter(n => n.status === "Published").length;
    const pinnedCount = notices.filter(n => n.pinned).length;
    $("statActive").textContent = activeCount;
    $("statPinned").textContent = pinnedCount;
    if ($("dActive")) $("dActive").textContent = activeCount;


    const latestEl = $("latest");
    if (latestEl) {
      latestEl.innerHTML = notices.slice(0, 3).map(n => `
        <li><div><strong>${esc(n.title)}</strong><br><small>${esc(n.summary)}</small></div><span>${esc(n.date)}</span></li>
      `).join('');
    }
  }


  // Navigation switcher
  document.querySelectorAll("#nav a").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = a.getAttribute("href").substring(1);
      document.querySelectorAll(".view").forEach(v => v.hidden = v.getAttribute("data-view") !== target);
      document.querySelectorAll("#nav a").forEach(l => l.classList.remove("active"));
      a.classList.add("active");
     
      const titles = {
        dashboard: ["Dashboard", "Overview of the student portal"],
        announcements: ["Announcements & Events / Admin", "Admin Panel / Announcements & Events"],
        schedule: ["Class Schedule", "Weekly classes for the current semester"],
        grades: ["Grades & Records", "Academic standing and final grades"],
        tuition: ["Tuition Assessment", "Fees for the current semester"],
        profile: ["Profile Management", "Update your account details"]
      };
      if (titles[target]) {
        $("pageTitle").textContent = titles[target][0];
        $("pageCrumb").textContent = titles[target][1];
      }
    });
  });


  // Search and filter event listeners
  const searchInput = $("search");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      query = e.target.value;
      render();
    });
  }


  const filtersEl = $("filters");
  if (filtersEl) {
    filtersEl.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") {
        document.querySelectorAll("#filters .pill").forEach(p => p.classList.remove("active"));
        e.target.classList.add("active");
        filter = e.target.getAttribute("data-cat");
        render();
      }
    });
  }


  // Row actions handler
  rowsEl.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const row = e.target.closest(".row");
    const id = Number(row.getAttribute("data-id"));
    const act = btn.getAttribute("data-act");
    const notice = notices.find(n => n.id === id);
    if (!notice) return;


    if (act === "pin") {
      notice.pinned = !notice.pinned;
      save();
      render();
    } else if (act === "del") {
      deletingId = id;
      $("deleteModal").hidden = false;
    } else if (act === "edit") {
      editingId = id;
      $("editHeading").textContent = "Edit Announcement";
      $("fTitle").value = notice.title;
      $("fCat").value = notice.category;
      $("fDept").value = notice.dept;
      $("fImportant").checked = (notice.category === "Important");
      $("fSummary").value = notice.summary;
      $("fContent").value = notice.content || "";
      $("formError").hidden = true;
      $("editModal").hidden = false;
    }
  });


  // Modal close handlers
  const closeModal = () => { $("editModal").hidden = true; editingId = null; };
  $("editClose").addEventListener("click", closeModal);
  $("editCancel").addEventListener("click", closeModal);


  // Post Notice button
  $("postBtn").addEventListener("click", () => {
    editingId = null;
    $("editHeading").textContent = "Post Notice";
    $("fTitle").value = "";
    $("fCat").value = "Important";
    $("fDept").value = "Student Affairs Office";
    $("fImportant").checked = true;
    $("fSummary").value = "";
    $("fContent").value = "";
    $("formError").hidden = true;
    $("editModal").hidden = false;
  });


  // Edit/Post Form Submit
  $("editForm").addEventListener("submit", e => {
    e.preventDefault();
    const title = $("fTitle").value.trim();
    const summary = $("fSummary").value.trim();
    if (!title || !summary) {
      $("formError").hidden = false;
      return;
    }
    const category = $("fCat").value;
    const dept = $("fDept").value.trim() || "Student Affairs Office";
    const content = $("fContent").value.trim();
    const isImportant = $("fImportant").checked;
    const finalCat = isImportant ? "Important" : category;


    if (editingId) {
      const n = notices.find(item => item.id === editingId);
      if (n) {
        n.title = title;
        n.summary = summary;
        n.category = finalCat;
        n.dept = dept;
        n.content = content;
        if (finalCat === "Important") n.pinned = true;
      }
    } else {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = new Date().toLocaleDateString('en-US', options);
      notices.unshift({
        id: nextId++,
        title,
        summary,
        category: finalCat,
        dept,
        date: dateStr,
        status: "Published",
        pinned: finalCat === "Important",
        content
      });
    }
    save();
    render();
    closeModal();
  });


  // Delete modal actions
  $("delCancel").addEventListener("click", () => { $("deleteModal").hidden = true; deletingId = null; });
  $("delConfirm").addEventListener("click", () => {
    if (deletingId !== null) {
      notices = notices.filter(n => n.id !== deletingId);
      save();
      render();
      $("deleteModal").hidden = true;
      deletingId = null;
    }
  });


  // Restore defaults
  $("restoreBtn").addEventListener("click", () => {
    notices = defaults();
    save();
    render();
  });


  // Profile Form save success message
  $("profileForm").addEventListener("submit", e => {
    e.preventDefault();
    const okEl = $("profileOk");
    okEl.hidden = false;
    setTimeout(() => { okEl.hidden = true; }, 3000);
  });


  // Logout actions
  $("logoutBtn").addEventListener("click", () => { $("logoutModal").hidden = false; });
  $("logoutCancel").addEventListener("click", () => { $("logoutModal").hidden = true; });
  $("logoutConfirm").addEventListener("click", () => {
    $("logoutModal").hidden = true;
    $("signedOut").hidden = false;
  });
  $("loginAgain").addEventListener("click", () => {
    $("signedOut").hidden = true;
  });


  render();
})();

