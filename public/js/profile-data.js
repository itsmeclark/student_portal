// =================================================================
// PROFILE PAGE DATA: load profile, edit contact info, change photo
// (authHeaders() and LOGIN_PAGE come from profile.js, which loads first)
// =================================================================

const PROGRAMS = { BSIT: "Bachelor of Science in Information Technology" };

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");

let sessionRedirecting = false;
function sessionExpired() {
    if (sessionRedirecting) return;
    sessionRedirecting = true;
    localStorage.removeItem("token");
    alert("Your session has expired. Please log in again.");
    window.location.href = LOGIN_PAGE;
}

// Fills the box under a label, e.g. setField("Student ID", "2026001")
function setField(label, value) {
    for (const l of document.querySelectorAll(".grid label")) {
        if (l.textContent.trim() === label) {
            const box = l.parentElement.querySelector(".f");
            if (box) box.textContent = value || "—";
            return;
        }
    }
}

// Shows the photo in the big avatar circle and in the header
function showPhoto(url) {
    if (!url) return;

    const avatar = document.querySelector(".photo .avatar");
    if (avatar) {
        avatar.innerHTML = "";
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Profile photo";
        img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
        avatar.appendChild(img);
    }

    const headerIcon = document.querySelector("header .user > svg, header .user > img");
    if (headerIcon) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "";
        img.style.cssText = "width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #fff;";
        headerIcon.replaceWith(img);
    }
}

// ===== Step 1: load the profile =====
async function loadProfile() {
    try {
        const res = await fetch("/api/profile/me", {
            headers: authHeaders(),
            credentials: "include"
        });

        if (res.status === 401 || res.status === 403) return sessionExpired();
        if (!res.ok) throw new Error("HTTP " + res.status);

        const s = await res.json();
        const fullName = `${s.First_name} ${s.Last_name}`;

        // Header name
        const hdr = document.querySelector(".user .n");
        if (hdr && hdr.firstChild) hdr.firstChild.textContent = fullName;

        // Photo card
        const info = document.querySelectorAll(".info > div");
        if (info[0]) info[0].textContent = fullName;
        const email = document.querySelector(".info u");
        if (email) email.textContent = s.Email;
        if (info[2]) info[2].textContent = titleCase(s.Role);
        showPhoto(s.Profile_photo);

        // Student Information
        setField("Student ID", s.Id_number);
        setField("Program", PROGRAMS[s.Course] || s.Course);
        setField("Full Name", fullName);
        setField("College Email", s.Email);

        // Enrollment Details
        setField("Academic Year", s.Academic_year);
        setField("Semester", s.Semester);
        setField("Year Level", s.Year_level || s.Current_year_level);
        setField("Enrollment Type", titleCase(s.Enrollment_type));

        // Contact Information
        setField("Contact Number", s.Contact_num);
        setField("Current Address", s.Current_address);
        setField("Emergency Contact Number", s.Emergency_contact_num);
        setField("Emergency Contact Name", s.Emergency_contact_name);
    } catch (err) {
        console.error("Could not load profile:", err);
        alert("Could not load your profile. Check that the server and MySQL are running.");
    }
}

// ===== Step 2: edit contact info =====
const CONTACT_FIELDS = [
    { label: "Contact Number",           key: "contactNum",    type: "tel", maxLength: 11 },
    { label: "Current Address",          key: "address",                    maxLength: 255 },
    { label: "Emergency Contact Number", key: "emergencyNum",  type: "tel", maxLength: 11 },
    { label: "Emergency Contact Name",   key: "emergencyName",              maxLength: 150 }
];

function setupContactEdit() {
    const heading = [...document.querySelectorAll(".box.sec h2")]
        .find((h) => h.textContent.trim() === "CONTACT INFORMATION");
    if (!heading) return;
    const box = heading.parentElement;

    const actions = document.createElement("div");
    actions.className = "contact-actions";
    actions.innerHTML = `
        <span class="contact-msg"></span>
        <button type="button" class="contact-btn" data-act="edit">Edit</button>
        <button type="button" class="contact-btn primary" data-act="save" hidden>Save</button>
        <button type="button" class="contact-btn" data-act="cancel" hidden>Cancel</button>`;
    box.appendChild(actions);

    const msg       = actions.querySelector(".contact-msg");
    const editBtn   = actions.querySelector('[data-act="edit"]');
    const saveBtn   = actions.querySelector('[data-act="save"]');
    const cancelBtn = actions.querySelector('[data-act="cancel"]');
    let original = {};

    const fieldBox = (label) => {
        const l = [...box.querySelectorAll("label")].find((x) => x.textContent.trim() === label);
        return l ? l.parentElement.querySelector(".f") : null;
    };
    const showMsg = (text, ok) => { msg.textContent = text; msg.className = "contact-msg " + (ok ? "ok" : "err"); };
    const toggle = (editing) => { editBtn.hidden = editing; saveBtn.hidden = !editing; cancelBtn.hidden = !editing; };

    function startEdit() {
        original = {};
        for (const f of CONTACT_FIELDS) {
            const div = fieldBox(f.label);
            const text = div.textContent.trim();
            const value = text === "—" ? "" : text;
            original[f.key] = value;

            const input = document.createElement("input");
            input.className = "f f-input";
            input.type = f.type || "text";
            input.maxLength = f.maxLength;
            input.value = value;
            div.replaceWith(input);
        }
        toggle(true);
        showMsg("", true);
    }

    function stopEdit(values) {
        for (const f of CONTACT_FIELDS) {
            const input = fieldBox(f.label);
            const div = document.createElement("div");
            div.className = "f";
            div.textContent = values[f.key] || "—";
            input.replaceWith(div);
        }
        toggle(false);
    }

    async function save() {
        const body = {};
        for (const f of CONTACT_FIELDS) body[f.key] = fieldBox(f.label).value.trim();

        const phone = /^09\d{9}$/;
        if (!phone.test(body.contactNum) || !phone.test(body.emergencyNum)) {
            return showMsg("Numbers must be 11 digits starting with 09.", false);
        }

        saveBtn.disabled = true;
        showMsg("Saving...", true);
        try {
            const res = await fetch("/api/profile/me/contact", {
                method: "PUT",
                headers: authHeaders({ "Content-Type": "application/json" }),
                credentials: "include",
                body: JSON.stringify(body)
            });
            const data = await res.json().catch(() => ({}));

            if (res.status === 401 || res.status === 403) return sessionExpired();
            if (!res.ok) return showMsg(data.error || "Could not save.", false);

            stopEdit(data.contact);
            showMsg("Saved ✓", true);
        } catch {
            showMsg("Server not reachable.", false);
        } finally {
            saveBtn.disabled = false;
        }
    }

    editBtn.addEventListener("click", startEdit);
    cancelBtn.addEventListener("click", () => { stopEdit(original); showMsg("", true); });
    saveBtn.addEventListener("click", save);
}

// ===== Step 3: change photo =====
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function setupPhotoUpload() {
    const btn = document.querySelector(".btn-photo");
    const cam = document.querySelector(".photo .cam");
    if (!btn) return;

    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/jpeg,image/png";
    picker.hidden = true;
    document.body.appendChild(picker);

    const label = btn.textContent;
    btn.addEventListener("click", () => picker.click());
    if (cam) {
        cam.style.cursor = "pointer";
        cam.addEventListener("click", () => picker.click());
    }

    picker.addEventListener("change", async () => {
        const file = picker.files[0];
        picker.value = "";
        if (!file) return;

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            return alert("Please choose a JPG or PNG image.");
        }
        if (file.size > MAX_PHOTO_BYTES) {
            return alert("That image is too large. The maximum is 2 MB.");
        }

        btn.disabled = true;
        btn.textContent = "Uploading...";
        try {
            const res = await fetch("/api/profile/me/photo", {
                method: "POST",
                headers: authHeaders({ "Content-Type": file.type }),
                credentials: "include",
                body: file
            });
            const data = await res.json().catch(() => ({}));

            if (res.status === 401 || res.status === 403) return sessionExpired();
            if (!res.ok) return alert(data.error || "Could not upload the photo.");

            showPhoto(data.photo);
        } catch {
            alert("Server not reachable.");
        } finally {
            btn.disabled = false;
            btn.textContent = label;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    setupContactEdit();
    setupPhotoUpload();
});
