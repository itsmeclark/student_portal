/* =================================================================
   MY PROFILE
   - loads the student's personal info + enrollment details
   - changes the student's password through POST /home/password
   ================================================================= */

const LOGIN_PAGE = "/pages/index.html";

// Sets the text of an element, or "—" when the value is missing
function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value === null || value === undefined || value === "" ? "—" : value;
}

async function loadProfile() {
    try {
        const response = await fetch("/home/profile", {
            credentials: "include",
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                window.location.href = LOGIN_PAGE;
                return;
            }
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        const user = data.user || {};
        const enrollment = data.enrollment || {};

        const fullName = `${user.First_name || ""} ${user.Last_name || ""}`.trim();

        // Profile card
        setText("profileName", fullName);
        setText("profileEmail", user.Email);
        setText("profileRole", user.Role ? user.Role.charAt(0).toUpperCase() + user.Role.slice(1).toLowerCase() : "Student");

        // Student information
        setText("studentId", user.Id_number);
        setText("studentProgram", user.Course);
        setText("studentFullName", fullName);
        setText("studentEmail", user.Email);

        // Enrollment details
        setText("academicYear", enrollment.Academic_year);
        setText("semester", enrollment.Semester);
        setText("yearLevel", enrollment.Year_level || user.Current_year_level);
        setText("enrollmentType", enrollment.Enrollment_type);

        // Contact information
        setText("contactNumber", user.Contact_num);
        setText("currentAddress", user.Current_address);
        setText("emergencyNumber", user.Emergency_contact_num);
        setText("emergencyName", user.Emergency_contact_name);
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

/* ================================
   CHANGE PASSWORD MODAL
=============================== */
document.addEventListener("DOMContentLoaded", () => {
    loadProfile();

    const overlay = document.getElementById("ov");
    const message = document.getElementById("msg");
    const inputs = ["cur", "nw", "cf"].map((id) => document.getElementById(id));
    const saveButton = document.getElementById("save");

    function openPasswordModal() {
        inputs.forEach((input) => (input.value = ""));
        message.textContent = "";
        message.className = "msg";
        overlay.classList.add("open");
        inputs[0].focus();
    }

    function closePasswordModal() {
        overlay.classList.remove("open");
    }

    document.getElementById("openPw").addEventListener("click", openPasswordModal);
    document.getElementById("closePw").addEventListener("click", closePasswordModal);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closePasswordModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closePasswordModal();
    });

    saveButton.addEventListener("click", async () => {
        const [currentPassword, newPassword, confirmPassword] = inputs.map((input) => input.value);
        message.className = "msg err";

        if (!currentPassword || !newPassword || !confirmPassword) {
            message.textContent = "Please fill in all three fields.";
            return;
        }

        if (newPassword.length < 8) {
            message.textContent = "New password must be at least 8 characters.";
            return;
        }

        if (newPassword !== confirmPassword) {
            message.textContent = "New passwords do not match.";
            return;
        }

        saveButton.disabled = true;
        message.className = "msg";
        message.textContent = "Saving...";

        try {
            const response = await fetch("/home/password", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                message.className = "msg err";
                message.textContent = data.error || "Failed to change password. Please try again.";
                return;
            }

            message.className = "msg ok";
            message.textContent = data.message || "Password changed successfully.";
            setTimeout(closePasswordModal, 1500);
        } catch (error) {
            console.error("Error changing password:", error);
            message.className = "msg err";
            message.textContent = "Failed to change password. Please try again.";
        } finally {
            saveButton.disabled = false;
        }
    });
});
