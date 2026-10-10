document.addEventListener('DOMContentLoaded', function () {

    const termSelect   = document.getElementById('term');
    const periodSelect = document.getElementById('period');
    const viewAllBtn   = document.getElementById('viewAllBtn');
    const tbody        = document.getElementById('gradesBody');
    const sectionEl    = document.getElementById('infoSection');
    const yearEl       = document.getElementById('infoYear');
    const logoutBtn    = document.getElementById('logoutButton');

    // Period dropdown value -> property name in grades-data.js
    const PERIODS = {
        'Prelim':    'prelim',
        'Midterm':   'midterm',
        'Semifinal': 'semifinal',
        'Final':     'final_period'
    };

    function fmt(v) {
        return (v === null || v === undefined) ? '—' : Number(v).toFixed(2);
    }

    function finalGrade(s) {
        if (s.final !== undefined) return s.final;
        const g = [s.prelim, s.midterm, s.semifinal, s.final_period];
        if (g.some(x => x === null || x === undefined)) return null;
        return g.reduce((a, b) => a + b, 0) / g.length;
    }

    function render() {
        const data = GRADES_DATA[termSelect.value];
        const period = periodSelect.value;           // "All" or a period name
        const showAll = period === 'All';

        // Header cells: show/hide period columns
        document.querySelectorAll('[data-col]').forEach(function (th) {
            const col = th.dataset.col;
            const visible = showAll || col === PERIODS[period] || col === 'always';
            th.style.display = (col === 'final_grade' && !showAll) ? 'none' : (visible ? '' : 'none');
        });

        tbody.innerHTML = '';

        if (!data) {
            tbody.innerHTML = '<tr><td colspan="7">No records available for this term.</td></tr>';
            sectionEl.textContent = '—';
            yearEl.textContent = '—';
            return;
        }

        sectionEl.textContent = data.section;
        yearEl.textContent = data.yearLevel;

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
                const visible = showAll || c.col === 'always' || c.col === PERIODS[period];
                if (!visible || (c.col === 'final_grade' && !showAll)) td.style.display = 'none';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        viewAllBtn.classList.toggle('active', showAll);
    }

    // Changing the term loads that semester's grades
    termSelect.addEventListener('change', render);

    // Changing the period filters the table automatically
    periodSelect.addEventListener('change', render);

    // View All Grades: reset the filter and show every column
    viewAllBtn.addEventListener('click', function () {
        periodSelect.value = 'All';
        render();
    });

    // Log out
    logoutBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to log out?')) {
            alert('You have been logged out. Connect this button to your login page/session when backend login is ready.');
        }
    });

    render();
});
