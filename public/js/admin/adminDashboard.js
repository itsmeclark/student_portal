/* =================================================================
   ADMIN DASHBOARD
   Loads the real numbers from the database (GET /admin/stats) and
   renders them into the stat cards, the department summary table and
   the upcoming events panel.
   ================================================================= */

(function () {
    const ADMIN_LOGIN_PAGE = "/pages/admin.login.html";

    const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

    // "2026-09-21T21:58:32.000Z" -> local date, without a timezone shift
    function parseDate(value) {
        if (!value) return null;

        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        }

        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }

    function setStat(code, value, sub) {
        const valueElement = document.querySelector(`[data-stat="${code}"]`);
        if (valueElement) valueElement.textContent = formatNumber(value);

        const subElement = document.querySelector(`[data-stat-sub="${code}"]`);
        if (subElement && sub !== undefined) subElement.textContent = sub;
    }

    // Fills one row of the department summary table
    function setDepartmentRow(department) {
        const row = document.querySelector(`[data-dept-row="${department.code}"]`);
        if (!row) return;

        const cell = (field) => row.querySelector(`[data-field="${field}"]`);
        const students = cell("students");
        const male = cell("male");
        const female = cell("female");

        if (students) students.textContent = formatNumber(department.students);
        if (male) male.textContent = formatNumber(department.male);
        if (female) female.textContent = formatNumber(department.female);
    }

    // Appends the "Other" row when a course does not map to any of the six departments
    function appendOtherRow(department) {
        const body = document.getElementById("deptTableBody");
        if (!body || body.querySelector(`[data-dept-row="${department.code}"]`)) return;

        const row = document.createElement("tr");
        row.setAttribute("data-dept-row", department.code);
        row.innerHTML = `
            <td>${department.label}</td>
            <td data-dept="${department.code}" data-field="students">—</td>
            <td data-dept="${department.code}" data-field="male">—</td>
            <td data-dept="${department.code}" data-field="female">—</td>
        `;
        body.appendChild(row);
    }

    // Totals row of the department summary table
    function setTotals(departments) {
        const sum = (field) => departments.reduce((acc, department) => acc + Number(department[field] || 0), 0);

        const students = document.querySelector('[data-total="students"]');
        const male = document.querySelector('[data-total="male"]');
        const female = document.querySelector('[data-total="female"]');

        if (students) students.textContent = formatNumber(sum("students"));
        if (male) male.textContent = formatNumber(sum("male"));
        if (female) female.textContent = formatNumber(sum("female"));
    }

    // Renders the published announcements as upcoming events
    function renderEvents(events) {
        const container = document.getElementById("upcomingEvents");
        if (!container) return;

        if (!events || events.length === 0) {
            container.innerHTML = '<div class="empty-state">No upcoming events yet.</div>';
            return;
        }

        container.innerHTML = events.map((event) => {
            const date = parseDate(event.date);
            const month = date ? date.toLocaleDateString("en-US", { month: "short" }) : "TBA";
            const day = date ? date.getDate() : "--";
            const category = event.category ? `<p>${event.category}</p>` : "";
            const publishedBy = event.publishBy
                ? `<p><i class="fa-regular fa-user"></i> ${event.publishBy}</p>`
                : "";

            return `
                <div class="event-item">
                    <div class="event-date">
                        <div class="month">${month}</div>
                        <div class="day">${day}</div>
                    </div>
                    <div class="event-info">
                        <h4>${event.title}</h4>
                        ${category}
                        ${publishedBy}
                    </div>
                </div>
            `;
        }).join("");
    }

    async function loadDashboard() {
        try {
            const response = await fetch("/admin/stats", {
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = ADMIN_LOGIN_PAGE;
                    return;
                }
                throw new Error(`Request failed: ${response.status}`);
            }

            const data = await response.json();
            const totals = data.totals || {};
            const departments = data.departments || [];

            // Welcome banner + header name
            if (data.admin && data.admin.name) {
                const welcomeName = document.getElementById("welcomeName");
                if (welcomeName) welcomeName.textContent = data.admin.name;
            }

            // Total students card
            setStat(
                "TOTAL",
                totals.totalStudents,
                `${formatNumber(totals.activeStudents)} active · ${formatNumber(totals.enrolledThisTerm)} enrolled this term`
            );

            // One card per department
            departments.forEach((department) => {
                const sub = department.students > 0
                    ? `${formatNumber(department.male)} male · ${formatNumber(department.female)} female`
                    : "no students yet";

                setStat(department.code, department.students, sub);

                // Departments outside the six cards (e.g. "Other") get a table row
                if (!document.querySelector(`[data-dept-row="${department.code}"]`)) {
                    appendOtherRow(department);
                }
                setDepartmentRow(department);
            });

            // Totals row + events
            setTotals(departments);
            renderEvents(data.events);
        } catch (error) {
            console.error("Error loading dashboard:", error);

            const container = document.getElementById("upcomingEvents");
            if (container) {
                container.innerHTML = '<div class="empty-state">Could not load the dashboard data.</div>';
            }
        }
    }

    document.addEventListener("DOMContentLoaded", loadDashboard);
})();
