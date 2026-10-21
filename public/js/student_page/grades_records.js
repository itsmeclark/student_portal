// Login page for the student portal (student-shell.js uses the same target)
const STUDENT_LOGIN_PAGE = "/pages/index.html";

document.addEventListener('DOMContentLoaded', function () {

    const termSelect   = document.getElementById('term');
    const periodSelect = document.getElementById('period');
    const viewAllBtn   = document.getElementById('viewAllBtn');
    const tbody        = document.getElementById('gradesBody');
    const sectionEl    = document.getElementById('infoSection');
    const yearEl       = document.getElementById('infoYear');
    const idNumberEl   = document.getElementById('infoIdNumber');
    const nameEl       = document.getElementById('infoName');

    // NOTE: the header name and the Log Out button are handled by student-shell.js

    // Period dropdown value -> property name in API response
    const PERIODS = {
        'Prelim':    'prelim',
        'Midterm':   'midterm',
        'Semifinal': 'semifinal',
        'Final':     'final_period'
    };

    function fmt(v) {
        // Always display one decimal place, guard against NaN
        if (v === null || v === undefined) return '—';
        const n = Number(v);
        if (Number.isNaN(n)) return '—';
        return n.toFixed(1);
    }

    function finalGrade(s) {
        // Calculate FINAL GRADE as average of all available periods
        const periods = [s.prelim, s.midterm, s.semifinal, s.final_period];
        const available = periods.map(g => Number(g)).filter(g => !Number.isNaN(g));
        if (available.length === 0) return null;
        return available.reduce((a, b) => a + b, 0) / available.length;
    }

    async function loadTerms() {
        try {
            const response = await fetch('/home/terms', {
                credentials: 'include'
            });

            if (response.status === 401) {
                window.location.href = STUDENT_LOGIN_PAGE;
                return;
            }
            // 403 -> signed in but wrong role (e.g. an admin opening this page).
            // The page still works, so don't redirect. Same rule as student-shell.js.
            if (response.status === 403) {
                console.log("This page needs a student account.");
                return;
            }

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const data = await response.json();

            // Clear existing options
            termSelect.innerHTML = '';

            if (!data.terms || data.terms.length === 0) {
                termSelect.innerHTML = '<option value="">No terms available</option>';
                termSelect.disabled = true;
                return;
            }

            data.terms.forEach(function (t) {
                const option = document.createElement('option');
                option.value = t.termKey;
                option.textContent = t.label;
                termSelect.appendChild(option);
            });

            // Load grades for the first available term
            loadGrades();
        } catch (error) {
            console.error("Error loading terms:", error);
            termSelect.innerHTML = '<option value="">Error loading terms</option>';
        }
    }

    async function loadGrades() {
        const term = termSelect.value;
        const period = periodSelect.value;

        if (!term) {
            tbody.innerHTML = '<tr><td colspan="7">No term selected.</td></tr>';
            return;
        }

        try {
            const response = await fetch(`/home/grades?term=${encodeURIComponent(term)}&period=${encodeURIComponent(period)}`, {
                credentials: 'include'
            });

            if (response.status === 401) {
                window.location.href = STUDENT_LOGIN_PAGE;
                return;
            }
            // 403 -> signed in but wrong role (e.g. an admin opening this page).
            // The page still works, so don't redirect. Same rule as student-shell.js.
            if (response.status === 403) {
                console.log("This page needs a student account.");
                return;
            }

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const data = await response.json();
            render(data);
        } catch (error) {
            console.error("Error loading grades:", error);
            tbody.innerHTML = '<tr><td colspan="7">Failed to load grades. Please try again.</td></tr>';
            sectionEl.textContent = '—';
            yearEl.textContent = '—';
            idNumberEl.textContent = '—';
            nameEl.textContent = '—';
        }
    }

    function render(data) {
        const showAll = periodSelect.value === 'All';

        // Header cells: show/hide period columns
        document.querySelectorAll('[data-col]').forEach(function (th) {
            const col = th.dataset.col;
            const visible = showAll || col === PERIODS[periodSelect.value] || col === 'always';
            th.style.display = (col === 'final_grade' && !showAll) ? 'none' : (visible ? '' : 'none');
        });

        tbody.innerHTML = '';

        // Display student info
        idNumberEl.textContent = data.idNumber || '—';
        const first = data.firstName ? data.firstName : '';
        const last = data.lastName ? data.lastName : '';
        nameEl.textContent = (first + ' ' + last).trim() || '—';
        sectionEl.textContent = data.section || '—';
        yearEl.textContent = data.yearLevel || '—';

        if (!data || !data.subjects || data.subjects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No records available for this term.</td></tr>';
            return;
        }

        data.subjects.forEach(function (s) {
            const tr = document.createElement('tr');
            const cells = [
                { col: 'always',       cls: '',            val: s.edp },
                { col: 'always',       cls: 'subject',     val: s.name },
                { col: 'prelim',       cls: '',            val: fmt(s.prelim) },
                { col: 'midterm',      cls: '',            val: fmt(s.midterm) },
                { col: 'semifinal',    cls: '',            val: fmt(s.semifinal) },
                { col: 'final_period', cls: '',            val: fmt(s.final_period) },
                { col: 'final_grade',  cls: 'final-grade', val: fmt(finalGrade(s)) }
            ];
            cells.forEach(function (c) {
                const td = document.createElement('td');
                td.textContent = c.val;
                if (c.cls) td.className = c.cls;
                const visible = showAll || c.col === 'always' || c.col === PERIODS[periodSelect.value];
                if (!visible || (c.col === 'final_grade' && !showAll)) td.style.display = 'none';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        viewAllBtn.classList.toggle('active', showAll);
    }

    // Changing the term loads that semester's grades
    termSelect.addEventListener('change', loadGrades);

    // Changing the period filters the table automatically
    periodSelect.addEventListener('change', loadGrades);

    // View All Grades: reset the filter and show every column
    viewAllBtn.addEventListener('click', function () {
        periodSelect.value = 'All';
        loadGrades();
    });

    // Initial load: fetch terms first, then grades
    loadTerms();
});
