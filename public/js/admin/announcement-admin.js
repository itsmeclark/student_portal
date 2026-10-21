/* =================================================================
   ADMIN - ANNOUNCEMENTS & EVENTS
   Lets an admin post, edit, pin and remove the notices shown to
   students.

   This page is STATIC: the notices live in the browser only and
   nothing is sent to the server. There is no fetch() call here on
   purpose - the only request the page makes is the shared admin
   shell asking /admin/dashboard for the signed-in admin's name.

   Everything lives inside this IIFE so the script never clashes with
   the other scripts loaded on the same page.
   ================================================================= */

(function () {
    const CATEGORIES = ["Important", "Event", "Scholarship", "General"];

    // The notices shown on the page. Changes stay in the browser and
    // are gone when the page is reloaded.
    let notices = [
        {
            id: 1,
            title: 'Class Suspension - Tropical Cyclone Warning',
            summary: 'All in-person classes are suspended for Sept 2 due to the current weather advisory.',
            content: 'Asynchronous modules and course updates will be posted on each respective course page. Please stay safe indoors and monitor official communication channels for further updates regarding class resumptions.',
            category: 'Important',
            department: 'Alayao Publication',
            date: 'September 1, 2026',
            status: 'Published',
            pinned: true
        },
        {
            id: 2,
            title: 'Dragon Week Opening Ceremony',
            summary: 'Lion dance, cultural presentations, and band performance.',
            content: 'Join the CEC community for the grand opening program of Dragon Week! The festivities will feature the traditional lion dance performance, a showcase by the college band, food stalls, and interactive booths prepared by student organizations.',
            category: 'Event',
            department: 'Student Affairs Office',
            date: 'January 18, 2026',
            status: 'Published',
            pinned: false
        },
        {
            id: 3,
            title: 'CHED Scholarship Applications for 2nd Semester Now Accepting',
            summary: 'TES and Merit Scholarship applicants for AY 2025-2026.',
            content: 'Eligible students may apply for CHED scholarships for the upcoming semester. Submit requirements to the Scholarship Office on or before November 2, 2026.',
            category: 'Scholarship',
            department: 'Scholarship Office',
            date: 'October 20, 2026',
            status: 'Published',
            pinned: false
        },
        {
            id: 4,
            title: 'Library Hours Extended During Examination Period',
            summary: 'The College Library will extend its operating hours during the final examination period.',
            content: 'The College Library will extend its operating hours during the final examination period. The library will be open from 7:00 AM to 9:00 PM, Monday to Saturday.',
            category: 'General',
            department: 'Library Services',
            date: 'October 15, 2026',
            status: 'Published',
            pinned: false
        }
    ];

    let nextId = 5;
    let editingId = null;
    let pendingDeleteId = null;
    let activeCategory = 'All';

    const tableBody = document.getElementById('noticeTableBody');
    const searchInput = document.getElementById('searchInput');
    const filterPills = document.getElementById('filterPills');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const noticeForm = document.getElementById('noticeForm');

    // ---------- HELPERS ----------

    function escapeHTML(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function categoryClass(category) {
        return String(category || '').toLowerCase();
    }

    function todayLabel() {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function visibleNotices() {
        const query = searchInput.value.trim().toLowerCase();

        return notices.filter(function (notice) {
            const matchesCategory = activeCategory === 'All' || notice.category === activeCategory;

            if (!matchesCategory) return false;
            if (!query) return true;

            return [notice.title, notice.summary, notice.department, notice.category]
                .filter(Boolean)
                .some(function (field) {
                    return String(field).toLowerCase().includes(query);
                });
        });
    }

    // ---------- RENDERING ----------

    function renderNotices() {
        const rows = visibleNotices();
        tableBody.innerHTML = '';

        rows.forEach(function (notice) {
            const tr = document.createElement('tr');

            // Notice
            const noticeCell = document.createElement('td');
            noticeCell.innerHTML = '<div class="notice-title">' + escapeHTML(notice.title) + '</div>'
                + '<div class="notice-desc">' + escapeHTML(notice.summary) + '</div>';
            tr.appendChild(noticeCell);

            // Category
            const categoryCell = document.createElement('td');
            const badge = document.createElement('span');
            badge.className = 'badge ' + categoryClass(notice.category);
            badge.textContent = notice.category;
            categoryCell.appendChild(badge);
            tr.appendChild(categoryCell);

            // Department
            const departmentCell = document.createElement('td');
            departmentCell.textContent = notice.department || '—';
            tr.appendChild(departmentCell);

            // Date posted
            const dateCell = document.createElement('td');
            dateCell.textContent = notice.date;
            tr.appendChild(dateCell);

            // Status
            const statusCell = document.createElement('td');
            const status = document.createElement('div');
            status.className = 'status';
            const dot = document.createElement('span');
            dot.className = 'status-dot';
            status.appendChild(dot);
            status.appendChild(document.createTextNode(' ' + notice.status));
            statusCell.appendChild(status);
            tr.appendChild(statusCell);

            // Actions
            const actionCell = document.createElement('td');
            const actions = document.createElement('div');
            actions.className = 'actions';
            actions.style.justifyContent = 'flex-end';

            const editButton = document.createElement('button');
            editButton.className = 'action-btn';
            editButton.type = 'button';
            editButton.title = 'Edit';
            editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
            editButton.addEventListener('click', function () { openEditModal(notice); });

            const pinButton = document.createElement('button');
            pinButton.className = 'action-btn';
            pinButton.type = 'button';
            pinButton.title = notice.pinned ? 'Unpin' : 'Pin';
            pinButton.style.color = notice.pinned ? '#b45309' : '';
            pinButton.innerHTML = notice.pinned
                ? '<i class="fa-solid fa-star"></i>'
                : '<i class="fa-regular fa-star"></i>';
            pinButton.addEventListener('click', function () { togglePin(notice); });

            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-btn delete';
            deleteButton.type = 'button';
            deleteButton.title = 'Remove';
            deleteButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
            deleteButton.addEventListener('click', function () { openDeleteModal(notice); });

            actions.appendChild(editButton);
            actions.appendChild(pinButton);
            actions.appendChild(deleteButton);
            actionCell.appendChild(actions);
            tr.appendChild(actionCell);

            tableBody.appendChild(tr);
        });

        if (rows.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 6;
            td.style.textAlign = 'center';
            td.style.color = '#888';
            td.style.padding = '30px';
            td.textContent = notices.length === 0
                ? 'No notices yet. Use "Post Notice" to create one.'
                : 'No notice matches your search.';
            tr.appendChild(td);
            tableBody.appendChild(tr);
        }

        renderStats();
    }

    function renderStats() {
        const active = notices.filter(function (n) { return n.status === 'Published'; }).length;
        const pinned = notices.filter(function (n) { return n.pinned; }).length;
        const drafts = notices.filter(function (n) { return n.status === 'Draft'; }).length;

        document.getElementById('statActive').textContent = active;
        document.getElementById('statPinned').textContent = pinned;
        document.getElementById('statDraft').textContent = drafts;
    }

    // ---------- MODALS ----------

    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
    }

    function openPostModal() {
        editingId = null;
        noticeForm.reset();
        document.getElementById('editModalTitle').textContent = 'Post Announcement';
        openModal(editModal);
        document.getElementById('noticeTitle').focus();
    }

    function openEditModal(notice) {
        editingId = notice.id;
        document.getElementById('editModalTitle').textContent = 'Edit Announcement';
        document.getElementById('noticeTitle').value = notice.title;
        document.getElementById('noticeCategory').value = notice.category;
        document.getElementById('noticeDepartment').value = notice.department;
        document.getElementById('noticeStatus').value = notice.status;
        document.getElementById('noticeSummary').value = notice.summary;
        document.getElementById('noticeContent').value = notice.content || '';
        document.getElementById('tagImportant').checked = notice.pinned;
        openModal(editModal);
        document.getElementById('noticeTitle').focus();
    }

    function openDeleteModal(notice) {
        pendingDeleteId = notice.id;
        document.getElementById('deleteMessage').textContent =
            'Are you sure you want to remove "' + notice.title + '"? This can\'t be undone.';
        openModal(deleteModal);
    }

    // ---------- ACTIONS ----------

    function togglePin(notice) {
        notice.pinned = !notice.pinned;
        renderNotices();
    }

    noticeForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const title = document.getElementById('noticeTitle').value.trim();
        const summary = document.getElementById('noticeSummary').value.trim();

        if (!title || !summary) return;

        const values = {
            title: title,
            summary: summary,
            content: document.getElementById('noticeContent').value.trim(),
            category: document.getElementById('noticeCategory').value,
            department: document.getElementById('noticeDepartment').value.trim(),
            status: document.getElementById('noticeStatus').value,
            pinned: document.getElementById('tagImportant').checked
        };

        if (editingId !== null) {
            const notice = notices.find(function (n) { return n.id === editingId; });
            if (notice) Object.assign(notice, values);
        } else {
            notices.unshift(Object.assign({ id: nextId++, date: todayLabel() }, values));
        }

        closeModal(editModal);
        editingId = null;
        renderNotices();
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
        if (pendingDeleteId === null) return;

        notices = notices.filter(function (n) { return n.id !== pendingDeleteId; });
        pendingDeleteId = null;
        closeModal(deleteModal);
        renderNotices();
    });

    // ---------- EVENTS ----------

    document.getElementById('openPostModal').addEventListener('click', openPostModal);
    document.getElementById('closeEditBtn').addEventListener('click', function () { closeModal(editModal); });
    document.getElementById('cancelEditBtn').addEventListener('click', function () { closeModal(editModal); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function () { closeModal(deleteModal); });

    editModal.addEventListener('click', function (event) {
        if (event.target === editModal) closeModal(editModal);
    });

    deleteModal.addEventListener('click', function (event) {
        if (event.target === deleteModal) closeModal(deleteModal);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        if (deleteModal.classList.contains('active')) closeModal(deleteModal);
        else if (editModal.classList.contains('active')) closeModal(editModal);
    });

    filterPills.addEventListener('click', function (event) {
        const pill = event.target.closest('.pill');
        if (!pill) return;

        activeCategory = pill.getAttribute('data-category');
        filterPills.querySelectorAll('.pill').forEach(function (other) {
            other.classList.toggle('active', other === pill);
        });

        renderNotices();
    });

    searchInput.addEventListener('input', renderNotices);

    // ---------- START ----------

    renderNotices();
})();
