/* =================================================================
   MY PROFILE
   - loads the student's personal info + enrollment details
   - edits the student's contact information (PUT /home/profile)
   - changes the student's password through POST /home/password
   ================================================================= */

const LOGIN_PAGE = "/pages/index.html";

// The values the student is allowed to change
const EDIT_FIELDS = [
    { field: "email", inputId: "edit-email", type: "email" },
    { field: "contactNumber", inputId: "edit-contactNumber", type: "tel" },
    { field: "currentAddress", inputId: "edit-currentAddress", type: "text" },
    { field: "emergencyNumber", inputId: "edit-emergencyNumber", type: "tel" },
    { field: "emergencyName", inputId: "edit-emergencyName", type: "text" }
];

// Raw values of the logged-in student, used to fill the edit inputs
let currentProfile = null;
let editMode = false;

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

        currentProfile = user;

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
   EDIT CONTACT INFORMATION
=============================== */

// The value a field holds on the server
function fieldValue(field) {
    if (!currentProfile) return "";

    switch (field) {
        case "email": return currentProfile.Email || "";
        case "contactNumber": return currentProfile.Contact_num || "";
        case "currentAddress": return currentProfile.Current_address || "";
        case "emergencyNumber": return currentProfile.Emergency_contact_num || "";
        case "emergencyName": return currentProfile.Emergency_contact_name || "";
        default: return "";
    }
}

// Turns the read-only boxes into input fields
function startEdit() {
    if (editMode) return;

    const actions = document.getElementById("contactActions");
    const editButton = document.getElementById("editContactBtn");
    const note = document.getElementById("contactNote");

    EDIT_FIELDS.forEach(({ field, inputId, type }) => {
        const box = document.querySelector(`[data-edit-field="${field}"]`);
        if (!box || document.getElementById(inputId)) return;

        const input = document.createElement("input");
        input.type = type;
        input.id = inputId;
        input.className = "edit-input";
        input.value = fieldValue(field);
        input.setAttribute("data-edit-for", field);

        box.parentNode.insertBefore(input, box.nextSibling);
        box.style.display = "none";
    });

    if (actions) {
        actions.classList.remove("hidden", "saved");
    }
    if (editButton) editButton.disabled = true;
    if (note) {
        note.textContent = "";
        note.className = "form-note";
    }

    editMode = true;

    const firstInput = document.getElementById(EDIT_FIELDS[0].inputId);
    if (firstInput) firstInput.focus();
}

// Removes the input fields and shows the saved values again
function exitEditMode() {
    EDIT_FIELDS.forEach(({ field, inputId }) => {
        const input = document.getElementById(inputId);
        const box = document.querySelector(`[data-edit-field="${field}"]`);

        if (input) input.remove();
        if (box) box.style.display = "";
    });

    const editButton = document.getElementById("editContactBtn");
    if (editButton) editButton.disabled = false;

    editMode = false;
}

// Cancels the edit and hides the whole action row
function cancelEdit() {
    exitEditMode();

    const actions = document.getElementById("contactActions");
    const note = document.getElementById("contactNote");

    if (actions) {
        actions.classList.add("hidden");
        actions.classList.remove("saved");
    }
    if (note) {
        note.textContent = "";
        note.className = "form-note";
    }
}

// Writes the saved values back into the read-only boxes
function showSavedValues(values) {
    const boxes = {
        email: "studentEmail",
        contactNumber: "contactNumber",
        currentAddress: "currentAddress",
        emergencyNumber: "emergencyNumber",
        emergencyName: "emergencyName"
    };

    Object.entries(boxes).forEach(([field, id]) => {
        setText(id, values[field]);
    });

    if (currentProfile) {
        currentProfile.Email = values.email;
        currentProfile.Contact_num = values.contactNumber;
        currentProfile.Current_address = values.currentAddress;
        currentProfile.Emergency_contact_num = values.emergencyNumber;
        currentProfile.Emergency_contact_name = values.emergencyName;
    }

    setText("profileEmail", values.email);
}

async function saveEdit() {
    const saveButton = document.getElementById("saveContactBtn");
    const note = document.getElementById("contactNote");
    if (!saveButton || !note) return;

    const values = {};
    EDIT_FIELDS.forEach(({ field, inputId }) => {
        const input = document.getElementById(inputId);
        values[field] = input ? input.value.trim() : "";
    });

    // Light client side check, the server validates again
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+\-\s()]{7,20}$/;

    let invalid = null;
    if (!emailPattern.test(values.email)) invalid = "Please enter a valid college email address.";
    else if (!phonePattern.test(values.contactNumber)) invalid = "Please enter a valid contact number (7 to 20 digits).";
    else if (!values.currentAddress) invalid = "Please fill in your current address.";
    else if (!phonePattern.test(values.emergencyNumber)) invalid = "Please enter a valid emergency contact number (7 to 20 digits).";
    else if (!values.emergencyName) invalid = "Please fill in your emergency contact name.";

    if (invalid) {
        note.textContent = invalid;
        note.className = "form-note err";
        return;
    }

    saveButton.disabled = true;
    note.textContent = "Saving...";
    note.className = "form-note";

    try {
        const response = await fetch("/home/profile", {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            note.textContent = data.error || "Failed to update your contact information.";
            note.className = "form-note err";
            return;
        }

        showSavedValues(data.profile || values);
        exitEditMode();

        const actions = document.getElementById("contactActions");
        if (actions) {
            actions.classList.remove("hidden");
            actions.classList.add("saved");
        }
        note.textContent = data.message || "Contact information updated successfully.";
        note.className = "form-note ok";
    } catch (error) {
        console.error("Error updating profile:", error);
        note.textContent = "Failed to update your contact information. Please try again.";
        note.className = "form-note err";
    } finally {
        saveButton.disabled = false;
    }
}

/* ================================
   CHANGE PASSWORD MODAL
=============================== */
document.addEventListener("DOMContentLoaded", () => {
    loadProfile();

    // Contact information editing
    const editButton = document.getElementById("editContactBtn");
    const cancelButton = document.getElementById("cancelContactBtn");
    const saveButton = document.getElementById("saveContactBtn");

    if (editButton) editButton.addEventListener("click", startEdit);
    if (cancelButton) cancelButton.addEventListener("click", cancelEdit);
    if (saveButton) saveButton.addEventListener("click", saveEdit);

    const overlay = document.getElementById("ov");
    const message = document.getElementById("msg");
    const inputs = ["cur", "nw", "cf"].map((id) => document.getElementById(id));
    const saveButtonPw = document.getElementById("save");

    // Resets a password field to a hidden state (and its eye icon back to "show")
    function resetPasswordField(input) {
        if (!input) return;
        input.type = "password";

        const button = document.querySelector(`[data-password-toggle="${input.id}"]`);
        if (!button) return;

        const icon = button.querySelector("i");
        if (icon) {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", "Show password");
    }

    function openPasswordModal() {
        inputs.forEach((input) => {
            input.value = "";
            resetPasswordField(input);
        });
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

    saveButtonPw.addEventListener("click", async () => {
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

        saveButtonPw.disabled = true;
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
            saveButtonPw.disabled = false;
        }
    });
});
