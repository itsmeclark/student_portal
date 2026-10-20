/* =================================================================
   STUDENT CLASS SCHEDULE
   Builds the weekly schedule grid from the enrolled subjects that
   are stored in the database (GET /home/subjects).

   Everything lives inside this IIFE so the script never clashes with
   the other scripts loaded on the same page.
   ================================================================= */

(function () {
    const STUDENT_LOGIN_PAGE = "/pages/index.html";

    const DAY_NAMES = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    // The database stores the meeting days as letters (e.g. "MWF", "TTH").
    // T is Tuesday and H is Thursday, the same convention the student
    // dashboard uses.
    const DAY_CODES = {
        M: "MONDAY",
        T: "TUESDAY",
        W: "WEDNESDAY",
        H: "THURSDAY",
        F: "FRIDAY",
        S: "SATURDAY"
    };

    // "08:00" -> "8:00 AM", "13:00" -> "1:00 PM"
    function formatTime(time) {
        if (!time) return "";

        const parts = String(time).trim().split(":");
        const hour = Number(parts[0]);
        const minute = parts[1] || "00";

        if (Number.isNaN(hour)) return String(time);

        const suffix = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
    }

    // "08:00" -> minutes since midnight (used to sort the time slots)
    function timeToMinutes(time) {
        const parts = String(time || "").trim().split(":");
        const hour = Number(parts[0]);
        const minute = Number(parts[1] || 0);

        if (Number.isNaN(hour)) return Number.MAX_SAFE_INTEGER;
        return hour * 60 + minute;
    }

    // "MWF" -> ["MONDAY", "WEDNESDAY", "FRIDAY"]
    function scheduledDays(scheduleDays) {
        const code = String(scheduleDays || "").toUpperCase();

        return [...new Set(code.split("").map((letter) => DAY_CODES[letter]).filter(Boolean))];
    }

    // "1st Semester" + "2025-2026" -> "1ST SEMESTER S.Y. 2025-2026"
    function formatTerm(term) {
        if (!term || !term.semester) return "";

        const semester = String(term.semester).toUpperCase();
        const academicYear = term.academicYear ? `S.Y. ${term.academicYear}` : "";
        return [semester, academicYear].filter(Boolean).join(" ");
    }

    // One time slot row of the grid
    function buildTimeRow(subjects) {
        const row = document.createElement("tr");

        const timeCell = document.createElement("td");
        timeCell.className = "time";
        timeCell.textContent = `${formatTime(subjects[0].Start_time)} – ${formatTime(subjects[0].End_time)}`;
        row.appendChild(timeCell);

        DAY_NAMES.forEach((day) => {
            const cell = document.createElement("td");
            const classes = subjects.filter((subject) => scheduledDays(subject.Schedule_days).includes(day));

            if (classes.length === 0) {
                const empty = document.createElement("span");
                empty.className = "empty";
                empty.textContent = "—";
                cell.appendChild(empty);
            } else {
                classes.forEach((subject) => {
                    const subjectName = document.createElement("span");
                    subjectName.className = "subject";
                    subjectName.textContent = subject.Subject_name || subject.Subject_code || "";

                    const code = document.createElement("span");
                    code.className = "detail";
                    code.textContent = subject.Subject_code || "";

                    const room = document.createElement("span");
                    room.className = "detail";
                    room.textContent = subject.Room || "";

                    const instructor = document.createElement("span");
                    instructor.className = "detail";
                    instructor.textContent = subject.Instructor_name || "";

                    cell.appendChild(subjectName);
                    cell.appendChild(code);
                    cell.appendChild(room);
                    cell.appendChild(instructor);
                });
            }

            row.appendChild(cell);
        });

        return row;
    }

    function renderSchedule(subjects) {
        const body = document.getElementById("studentScheduleBody");
        if (!body) return;

        body.innerHTML = "";

        if (!subjects || subjects.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "No classes are scheduled.";
            row.appendChild(cell);
            body.appendChild(row);
            return;
        }

        // One row per time slot, ordered by the start time
        const slots = new Map();
        subjects.forEach((subject) => {
            const key = `${subject.Start_time}|${subject.End_time}`;
            if (!slots.has(key)) slots.set(key, []);
            slots.get(key).push(subject);
        });

        const orderedSlots = [...slots.entries()].sort(
            (left, right) => timeToMinutes(left[1][0].Start_time) - timeToMinutes(right[1][0].Start_time)
        );

        orderedSlots.forEach(([, slotSubjects]) => {
            body.appendChild(buildTimeRow(slotSubjects));
        });
    }

    async function loadSchedule() {
        const status = document.getElementById("studentScheduleStatus");
        const semesterLabel = document.getElementById("semesterLabel");

        try {
            const response = await fetch("/home/subjects", {
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = STUDENT_LOGIN_PAGE;
                    return;
                }
                throw new Error(`Request failed: ${response.status}`);
            }

            const data = await response.json();
            const subjects = data.subjects || [];

            if (semesterLabel) {
                const term = formatTerm(data.term);
                semesterLabel.textContent = term || "No current term";
            }

            renderSchedule(subjects);

            // A subject that meets on a day without a column (e.g. Sunday) is
            // pointed out instead of being silently dropped.
            const hidden = subjects.filter((subject) => scheduledDays(subject.Schedule_days).length === 0);
            if (status && hidden.length > 0) {
                status.textContent = `${hidden.length} subject(s) have a day that is not shown in this grid.`;
            }
        } catch (error) {
            console.error("Error loading class schedule:", error);

            const body = document.getElementById("studentScheduleBody");
            if (body) {
                body.innerHTML = '<tr><td colspan="7">Could not load your class schedule.</td></tr>';
            }
            if (status) {
                status.textContent = "Could not load your class schedule. Please try again later.";
                status.classList.add("is-error");
            }
        }
    }

    document.addEventListener("DOMContentLoaded", loadSchedule);
})();
