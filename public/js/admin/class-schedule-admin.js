/* =================================================================
   ADMIN - CLASS SCHEDULE MANAGEMENT
   Lists the class schedules stored in the database and lets an admin
   add, edit and remove them.

   A room can only hold one class at a time: when the room, the day
   and the time clash with an existing schedule the form shows an
   OCCUPIED warning and refuses to save. The server re-checks the
   same rule, so the warning can never be bypassed.

   Everything lives inside this IIFE so the script never clashes with
   the other scripts loaded on the same page.
   ================================================================= */

(function () {
    const DAY_CODES = ["M", "T", "W", "H", "F", "S"];

    const DAY_NAMES = {
        M: "MONDAY",
        T: "TUESDAY",
        W: "WEDNESDAY",
        H: "THURSDAY",
        F: "FRIDAY",
        S: "SATURDAY"
    };

    const tableBody = document.getElementById('scheduleTableBody');
    const statusLine = document.getElementById('scheduleStatus');
    const scheduleModal = document.getElementById('scheduleModal');
    const scheduleForm = document.getElementById('scheduleForm');
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveScheduleBtn');
    const conflictWarning = document.getElementById('conflictWarning');
    const conflictMessage = document.getElementById('conflictMessage');
    const sectionSelect = document.getElementById('Section_id');
    const searchInput = document.getElementById('searchInput');
    const deleteModal = document.getElementById('deleteModal');
    const deleteMessage = document.getElementById('deleteMessage');

    let schedules = [];
    let editingId = null;
    let pendingDeleteId = null;

    // ---------- HELPERS ----------

    function showStatus(message, type) {
        statusLine.textContent = message;
        statusLine.classList.toggle('is-error', type === 'error');
        statusLine.classList.toggle('is-ok', type === 'ok');
    }

    function parseDays(value) {
        const letters = String(value || '').toUpperCase().split('');
        return DAY_CODES.filter(function (code) { return letters.includes(code); });
    }

    function formatDays(value) {
        return parseDays(value).map(function (code) { return DAY_NAMES[code]; }).join(' / ');
    }

    function formatTime(value) {
        if (!value) return '';

        const parts = String(value).trim().split(':');
        const hour = Number(parts[0]);
        const minute = parts[1] || '00';

        if (Number.isNaN(hour)) return String(value);

        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return displayHour + ':' + String(minute).padStart(2, '0') + ' ' + suffix;
    }

    function timeToMinutes(value) {
        const match = String(value || '').trim().match(/^(\d{1,2}):([0-5]\d)$/);
        if (!match) return null;

        const hour = Number(match[1]);
        if (hour > 23) return null;

        return hour * 60 + Number(match[2]);
    }

    function daysOverlap(a, b) {
        const left = parseDays(a);
        const right = parseDays(b);
        return left.some(function (code) { return right.includes(code); });
    }

    // Ranges that only touch (09:00 end / 09:00 start) do NOT overlap
    function timesOverlap(startA, endA, startB, endB) {
        const s1 = timeToMinutes(startA);
        const e1 = timeToMinutes(endA);
        const s2 = timeToMinutes(startB);
        const e2 = timeToMinutes(endB);

        if (s1 === null || e1 === null || s2 === null || e2 === null) return false;

        return s1 < e2 && s2 < e1;
    }

    function sameRoom(a, b) {
        return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
    }

    // The same rule the server uses
    function conflictsWith(a, b) {
        if (!a || !b) return false;
        if (a.Subject_id && b.Subject_id && Number(a.Subject_id) === Number(b.Subject_id)) return false;

        return sameRoom(a.Room, b.Room)
            && daysOverlap(a.Schedule_days, b.Schedule_days)
            && timesOverlap(a.Start_time, a.End_time, b.Start_time, b.End_time);
    }

    function describeSchedule(schedule) {
        return schedule.Subject_code + ' - ' + schedule.Subject_name
            + ' (' + formatDays(schedule.Schedule_days) + ' '
            + formatTime(schedule.Start_time) + ' - ' + formatTime(schedule.End_time)
            + ', ' + schedule.Room + ')';
    }

    // ---------- RENDERING ----------

    function visibleSchedules() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return schedules;

        return schedules.filter(function (schedule) {
            return [schedule.Subject_code, schedule.Subject_name, schedule.Room, schedule.Instructor_name, schedule.Section_program]
                .filter(Boolean)
                .some(function (field) { return String(field).toLowerCase().includes(query); });
        });
    }

    function renderSchedules() {
        tableBody.innerHTML = '';
        const rows = visibleSchedules();

        rows.forEach(function (schedule) {
            const tr = document.createElement('tr');

            // Subject
            const subjectCell = document.createElement('td');
            subjectCell.innerHTML = '<strong>' + escapeHTML(schedule.Subject_code) + '</strong>'
                + '<span class="cell-sub">' + escapeHTML(schedule.Subject_name) + '</span>';
            tr.appendChild(subjectCell);

            // Section
            const sectionCell = document.createElement('td');
            sectionCell.textContent = schedule.Section_program || '—';
            tr.appendChild(sectionCell);

            // Day
            const dayCell = document.createElement('td');
            dayCell.textContent = formatDays(schedule.Schedule_days);
            tr.appendChild(dayCell);

            // Time
            const timeCell = document.createElement('td');
            timeCell.textContent = formatTime(schedule.Start_time) + ' - ' + formatTime(schedule.End_time);
            tr.appendChild(timeCell);

            // Room (+ OCCUPIED badge when the room is double-booked)
            const roomCell = document.createElement('td');
            roomCell.appendChild(document.createTextNode(schedule.Room));
            if (schedule.occupied) {
                const badge = document.createElement('span');
                badge.className = 'occupied-badge';
                badge.textContent = 'OCCUPIED';
                badge.title = schedule.conflict ? 'Clashes with ' + describeSchedule(schedule.conflict) : '';
                roomCell.appendChild(badge);
            }
            tr.appendChild(roomCell);

            // Instructor
            const instructorCell = document.createElement('td');
            instructorCell.textContent = schedule.Instructor_name;
            tr.appendChild(instructorCell);

            // Actions
            const actionCell = document.createElement('td');
            actionCell.className = 'actions';

            const editButton = document.createElement('button');
            editButton.className = 'btn-action btn-edit';
            editButton.type = 'button';
            editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editButton.addEventListener('click', function () { openEditModal(schedule); });

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn-action btn-delete';
            deleteButton.type = 'button';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
            deleteButton.addEventListener('click', function () { openDeleteModal(schedule); });

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
            tr.appendChild(actionCell);

            tableBody.appendChild(tr);
        });

        if (rows.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 7;
            td.style.textAlign = 'center';
            td.style.color = '#888';
            td.style.padding = '20px';
            td.textContent = schedules.length === 0
                ? 'No schedules yet. Use "ADD SCHEDULE" to create one.'
                : 'No schedule matches your search.';
            tr.appendChild(td);
            tableBody.appendChild(tr);
        }
    }

    function escapeHTML(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ---------- DATA ----------

    async function loadSchedules() {
        try {
            const response = await fetch('/admin/schedule/list', { credentials: 'include' });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = '/pages/admin.login.html';
                    return;
                }
                throw new Error('Failed to load schedules');
            }

            const data = await response.json();
            schedules = data.schedules || [];
            renderSchedules();
        } catch (error) {
            console.error('Error loading schedules:', error);
            showStatus('Could not load the schedules. Please try again.', 'error');
        }
    }

    async function loadSections() {
        try {
            const response = await fetch('/admin/schedule/sections', { credentials: 'include' });
            if (!response.ok) return;

            const data = await response.json();
            const sections = data.sections || [];

            sectionSelect.innerHTML = '<option value="">Select Section</option>';
            sections.forEach(function (section) {
                const option = document.createElement('option');
                option.value = section.Section_id;
                option.textContent = section.Section_program || ('Section ' + section.Section_num);
                sectionSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading sections:', error);
        }
    }

    // ---------- MODAL ----------

    function selectedDays() {
        return Array.from(document.querySelectorAll('#dayPicker input:checked')).map(function (input) {
            return input.value;
        });
    }

    function setSelectedDays(days) {
        const wanted = parseDays(days);
        document.querySelectorAll('#dayPicker input').forEach(function (input) {
            input.checked = wanted.includes(input.value);
        });
    }

    function openModal() {
        scheduleModal.classList.add('active');
        document.getElementById('Subject_code').focus();
    }

    function closeModal() {
        scheduleModal.classList.remove('active');
        scheduleForm.reset();
        editingId = null;
        modalTitle.textContent = 'ADD SCHEDULE';
        hideConflict();
        checkConflict();
    }

    function openAddModal() {
        editingId = null;
        scheduleForm.reset();
        modalTitle.textContent = 'ADD SCHEDULE';
        hideConflict();
        openModal();
    }

    function openEditModal(schedule) {
        editingId = schedule.Subject_id;
        modalTitle.textContent = 'EDIT SCHEDULE';

        document.getElementById('Subject_code').value = schedule.Subject_code || '';
        document.getElementById('Subject_name').value = schedule.Subject_name || '';
        document.getElementById('Edp_code').value = schedule.Edp_code || '';
        document.getElementById('Room').value = schedule.Room || '';
        document.getElementById('Instructor_name').value = schedule.Instructor_name || '';
        document.getElementById('Start_time').value = schedule.Start_time || '';
        document.getElementById('End_time').value = schedule.End_time || '';
        sectionSelect.value = schedule.Section_id || '';
        setSelectedDays(schedule.Schedule_days);

        hideConflict();
        checkConflict();
        openModal();
    }

    function openDeleteModal(schedule) {
        pendingDeleteId = schedule.Subject_id;
        deleteMessage.textContent = 'Are you sure you want to delete ' + schedule.Subject_code + ' - ' + schedule.Subject_name + '?';
        deleteModal.classList.add('active');
    }

    function closeDeleteModal() {
        deleteModal.classList.remove('active');
        pendingDeleteId = null;
    }

    // ---------- ROOM AVAILABILITY ----------

    function hideConflict() {
        conflictWarning.classList.remove('show');
        conflictMessage.textContent = '';
        saveBtn.disabled = false;
    }

    function showConflict(message) {
        conflictMessage.textContent = message;
        conflictWarning.classList.add('show');
        saveBtn.disabled = true;
    }

    // Checks the room against every other schedule as the admin types
    function checkConflict() {
        const room = document.getElementById('Room').value.trim();
        const start = document.getElementById('Start_time').value;
        const end = document.getElementById('End_time').value;
        const days = selectedDays().join('');

        if (!room || !start || !end || !days) {
            hideConflict();
            return null;
        }

        const candidate = { Room: room, Schedule_days: days, Start_time: start, End_time: end };

        const clash = schedules.find(function (schedule) {
            if (editingId !== null && Number(schedule.Subject_id) === Number(editingId)) return false;
            return conflictsWith(candidate, schedule);
        });

        if (clash) {
            showConflict('Room ' + room + ' is already occupied on ' + describeSchedule(clash) + '.');
            return clash;
        }

        hideConflict();
        return null;
    }

    // ---------- SAVE / DELETE ----------

    scheduleForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const days = selectedDays();
        if (days.length === 0) {
            showStatus('Pick at least one meeting day.', 'error');
            return;
        }

        const payload = {
            Subject_code: document.getElementById('Subject_code').value.trim(),
            Subject_name: document.getElementById('Subject_name').value.trim(),
            Edp_code: document.getElementById('Edp_code').value.trim(),
            Instructor_name: document.getElementById('Instructor_name').value.trim(),
            Room: document.getElementById('Room').value.trim(),
            Start_time: document.getElementById('Start_time').value,
            End_time: document.getElementById('End_time').value,
            Schedule_days: days.join(''),
            Section_id: sectionSelect.value
        };

        saveBtn.disabled = true;

        try {
            const isEdit = editingId !== null;
            const response = await fetch(
                isEdit ? '/admin/schedule/update/' + editingId : '/admin/schedule/add',
                {
                    method: isEdit ? 'PUT' : 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json().catch(function () { return {}; });

            if (response.status === 409) {
                showConflict(data.error || 'That room is already occupied.');
                showStatus(data.error || 'That room is already occupied.', 'error');
                return;
            }

            if (!response.ok) {
                showStatus(data.error || 'Could not save the schedule.', 'error');
                return;
            }

            closeModal();
            await loadSchedules();
            showStatus(isEdit ? 'Schedule updated.' : 'Schedule saved.', 'ok');
        } catch (error) {
            console.error('Error saving schedule:', error);
            showStatus('Could not save the schedule. Please try again.', 'error');
        } finally {
            saveBtn.disabled = false;
            checkConflict();
        }
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
        if (pendingDeleteId === null) return;

        try {
            const response = await fetch('/admin/schedule/delete/' + pendingDeleteId, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json().catch(function () { return {}; });

            if (!response.ok) {
                showStatus(data.error || 'Could not delete the schedule.', 'error');
                closeDeleteModal();
                return;
            }

            closeDeleteModal();
            await loadSchedules();
            showStatus('Schedule deleted.', 'ok');
        } catch (error) {
            console.error('Error deleting schedule:', error);
            showStatus('Could not delete the schedule. Please try again.', 'error');
        }
    });

    // ---------- EVENTS ----------

    document.getElementById('openAddModal').addEventListener('click', openAddModal);
    document.getElementById('closeScheduleModal').addEventListener('click', closeModal);
    document.getElementById('cancelScheduleModal').addEventListener('click', closeModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);

    scheduleModal.addEventListener('click', function (event) {
        if (event.target === scheduleModal) closeModal();
    });

    deleteModal.addEventListener('click', function (event) {
        if (event.target === deleteModal) closeDeleteModal();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        if (deleteModal.classList.contains('active')) closeDeleteModal();
        else if (scheduleModal.classList.contains('active')) closeModal();
    });

    // Live room availability check
    ['Room', 'Start_time', 'End_time'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', checkConflict);
        document.getElementById(id).addEventListener('change', checkConflict);
    });

    document.querySelectorAll('#dayPicker input').forEach(function (input) {
        input.addEventListener('change', checkConflict);
    });

    searchInput.addEventListener('input', renderSchedules);

    // ---------- START ----------

    loadSections();
    loadSchedules();
})();
