/* =================================================================
   SHARED ADMIN HEADER BEHAVIOUR
   Used by every admin page so the header/nav stay identical:
     - fills the logged-in admin's name and role in the header
     - wires every [data-logout] button to POST /auth/admin/logout
     - turns nav entries whose page does not exist yet into
       "Not working yet" items (greyed out, not clickable)

   Everything lives inside this IIFE so the script never clashes with
   the other scripts loaded on the same page.
   ================================================================= */

(function () {
    const ADMIN_LOGIN_PAGE = "/pages/admin.login.html";

    // "ADMIN" -> "Administrator", "STUDENT" -> "Student"
    function formatRole(role) {
        if (!role) return "Administrator";

        const value = String(role).toUpperCase();
        if (value === "ADMIN") return "Administrator";
        if (value === "STUDENT") return "Student";

        return String(role).charAt(0).toUpperCase() + String(role).slice(1).toLowerCase();
    }

    // Fills every [data-admin-name] / [data-admin-role] element on the page
    async function loadAdminUser() {
        try {
            const response = await fetch("/admin/dashboard", {
                credentials: "include",
            });

            if (!response.ok) {
                // 401/403 -> not logged in (or not an admin) -> back to the admin login
                if (response.status === 401 || response.status === 403) {
                    window.location.href = ADMIN_LOGIN_PAGE;
                    return;
                }
                throw new Error(`Request failed: ${response.status}`);
            }

            const data = await response.json();
            const user = data.user || {};

            document.querySelectorAll("[data-admin-name]").forEach((element) => {
                element.textContent = user.Admin_name || "Admin";
            });

            document.querySelectorAll("[data-admin-role]").forEach((element) => {
                element.textContent = formatRole(user.Role);
            });
        } catch (error) {
            console.error("Error loading admin name:", error);
        }
    }

    // Log out of the admin portal from any [data-logout] button
    function bindLogoutButtons() {
        document.querySelectorAll("[data-logout]").forEach((button) => {
            button.addEventListener("click", async () => {
                try {
                    const response = await fetch("/auth/admin/logout", {
                        method: "POST",
                        credentials: "include",
                    });
                    if (response.ok) {
                        window.location.href = ADMIN_LOGIN_PAGE;
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

    // A nav entry without a real destination (page not built yet) is shown as
    // "Not working yet" instead of a dead link.
    function markUnavailableNavItems() {
        document.querySelectorAll(".navigation .nav-item").forEach((item) => {
            if (item.classList.contains("disabled")) return;

            const href = item.getAttribute("href");
            if (href && href !== "#") return;

            item.classList.add("disabled");
            item.setAttribute("aria-disabled", "true");
            item.setAttribute("title", "Not working yet");
            if (item.tagName === "A") item.removeAttribute("href");
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        bindLogoutButtons();
        loadAdminUser();
        markUnavailableNavItems();
    });
})();
