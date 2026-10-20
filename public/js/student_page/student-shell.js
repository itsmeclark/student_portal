/* =================================================================
   SHARED STUDENT HEADER BEHAVIOUR
   Used by every student page so the header/nav stay identical:
     - fills the logged-in student's name and role in the header
     - wires every [data-logout] button to POST /auth/logout
   ================================================================= */

const STUDENT_LOGIN_PAGE = "/pages/index.html";

// "STUDENT" -> "Student", "ADMIN" -> "Administrator"
function formatRole(role) {
    if (!role) return "Student";
    return String(role).charAt(0).toUpperCase() + String(role).slice(1).toLowerCase();
}

// Fills every [data-student-name] / [data-student-role] element on the page
async function loadShellUser() {
    try {
        const response = await fetch("/home/dashboard", {
            credentials: "include",
        });

        if (!response.ok) {
            // 401/403 -> not logged in
            if (response.status === 401 || response.status === 403) {
                window.location.href = STUDENT_LOGIN_PAGE;
                return;
            }
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        const user = data.user || {};
        const fullName = `${user.First_name || ""} ${user.Last_name || ""}`.trim();

        document.querySelectorAll("[data-student-name]").forEach((element) => {
            element.textContent = fullName || "Student";
        });

        document.querySelectorAll("[data-student-role]").forEach((element) => {
            element.textContent = formatRole(user.Role);
        });
    } catch (error) {
        console.error("Error loading student name:", error);
    }
}

// Log out of the portal from any [data-logout] button
function bindLogoutButtons() {
    document.querySelectorAll("[data-logout]").forEach((button) => {
        button.addEventListener("click", async () => {
            try {
                const response = await fetch("/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });
                if (response.ok) {
                    window.location.href = STUDENT_LOGIN_PAGE;
                } else {
                    alert("Logout failed. Please try again.");
                }
            } catch (error) {
                console.error("Error during logout:", error);
                alert("Logout failed. Please try again.");
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    bindLogoutButtons();
    loadShellUser();
});
