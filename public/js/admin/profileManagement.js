document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Toggle
    const burgerMenu = document.getElementById('burgerMenu');
    const sidebar = document.getElementById('sidebar');

    if (burgerMenu && sidebar) {
        burgerMenu.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Modal Functions
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    // Attach event listeners for opening Add modal
    const openAddModalBtn = document.getElementById('openAddModal');
    const openAddModalIcon = document.getElementById('openAddModalIcon');

    if (openAddModalBtn) {
        openAddModalBtn.addEventListener('click', () => openModal('addModal'));
    }
    if (openAddModalIcon) {
        openAddModalIcon.addEventListener('click', () => openModal('addModal'));
    }

    // Function to open Edit Modal: fetch student data and prefill the form
    window.openEditModal = async function(studentId) {
        currentEditId = studentId;
        try {
            // make sure the section dropdowns are populated before prefilling
            await sectionsReady;

            const response = await fetch(`/profileManagement/student/${studentId}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                if (handleAuthError(response.status)) return;
                const data = await response.json().catch(() => ({}));
                alert(data.error || 'Failed to load student data.');
                return;
            }

            const data = await response.json();
            const student = data.student;
            const enrollment = data.enrollment || {};

            document.getElementById('editId_number').value = student.Id_number || '';
            document.getElementById('editFullName').value = `${student.Last_name}, ${student.First_name}`;
            document.getElementById('editCourse').value = student.Course || '';
            document.getElementById('editEmail').value = student.Email || '';
            document.getElementById('editAcademic_year').value = enrollment.Academic_year || '';
            document.getElementById('editSemester').value = enrollment.Semester ? enrollment.Semester.split(' ')[0] : '';
            document.getElementById('editCurrent_year_level').value = student.Current_year_level || '';
            document.getElementById('editEnrollment_type').value = enrollment.Enrollment_type
                ? enrollment.Enrollment_type.charAt(0) + enrollment.Enrollment_type.slice(1).toLowerCase()
                : '';
            document.getElementById('editGender').value = student.Gender || '';
            document.getElementById('editSection_id').value = enrollment.Section_id || '';
            document.getElementById('editContact_num').value = student.Contact_num || '';
            document.getElementById('editEmergency_contact_name').value = student.Emergency_contact_name || '';
            document.getElementById('editCurrent_address').value = student.Current_address || '';
            document.getElementById('editStatus').value = student.Status || 'ACTIVE';
            document.getElementById('editEmergency_contact_num').value = student.Emergency_contact_num || '';
            document.getElementById('editPassword').value = student.Student_password || '';

            openModal('editModal');
        } catch (err) {
            console.error(err);
            alert('Failed to load student data. Please try again.');
        }
    }

    // Function to open Delete Modal (attached to buttons in HTML via onclick)
    window.openDeleteModal = function(studentId) {
        currentDeleteId = studentId;
        openModal('deleteModal');
    }

    // Close modals when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    // Real delete confirmation (replaces the old mock alert)
    const confirmDeleteBtn = document.querySelector('.btn-confirm-delete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (!currentDeleteId) return;
            try {
                const response = await fetch(`/profileManagement/deleteStudent/${currentDeleteId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    if (handleAuthError(response.status)) return;
                    alert(data.error || 'Failed to delete student. Please try again.');
                    return;
                }

                alert('Student deleted successfully!');
                closeModal('deleteModal');
                currentDeleteId = null;
                loadStudents();
            } catch (err) {
                console.error(err);
                alert('An error occurred while deleting the student. Please try again.');
            }
        });
    }

    // ---------- LOGOUT (header button + sidebar item) ----------
    async function adminLogout() {
        try {
            const response = await fetch('/auth/admin/logout', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                window.location.href = '/pages/admin.login.html';
            } else {
                alert('Logout failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('Logout failed. Please try again.');
        }
    }

    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', adminLogout);
    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', adminLogout);
});

// Modal state: which student is being edited/deleted right now
let currentEditId = null;
let currentDeleteId = null;

// Redirect to login when the server says we're not authenticated
function handleAuthError(status) {
    if (status === 401 || status === 403) {
        window.location.href = '/pages/login.html';
        return true;
    }
    return false;
}

// ---------- LOAD STUDENTS TABLE ----------
async function loadStudents() {
    try {
        const response = await fetch('/profileManagement/displayStudents', {
            credentials: 'include'
        });

        if (!response.ok) {
            if (handleAuthError(response.status)) return;
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        const tableBody = document.querySelector('#students_table');

        if (!data.students || data.students.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #888; padding: 20px;">No student records found.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = data.students.map(student => `
            <tr>
                <td>${student.First_name} ${student.Last_name}</td>
                <td>${student.Email}</td>
                <td>${student.Course}</td>
                <td>${student.Current_year_level}</td>
                <td class="status-active">${student.Status}</td>
                <td class="actions">
                    <button class="btn-action btn-edit" onclick="openEditModal(${student.Student_id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-action btn-delete" onclick="openDeleteModal(${student.Student_id})"><i class="fas fa-trash-alt"></i> Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

// ---------- LOAD SECTION DROPDOWN FROM DATABASE (both Add and Edit modals) ----------
async function loadSections() {
    try {
        const response = await fetch('/profileManagement/sections', {
            credentials: 'include'
        });

        if (!response.ok) {
            if (handleAuthError(response.status)) return;
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        const optionsFor = (sections) =>
            '<option value="">Select Section</option>' +
            sections.map(section => `
                <option value="${section.Section_id}">${section.Section_program}</option>
            `).join('');

        // Keep the placeholder, rebuild options from DB
        ['Section_id', 'editSection_id'].forEach(id => {
            const select = document.getElementById(id);
            if (select) select.innerHTML = optionsFor(data.sections);
        });
    } catch (err) {
        console.error(err);
    }
}

loadStudents();
const sectionsReady = loadSections();

// ---------- ADD STUDENT FORM SUBMISSION ----------
document.querySelector('#addStudent_form').addEventListener('submit', async (event) => {
    // Stop the form from doing a normal page reload
    event.preventDefault();

    const payload = {
        // Student Information
        Id_number: document.getElementById('Id_number').value.trim(),
        Full_name: document.getElementById('fullName').value.trim(),
        Course: document.getElementById('Course').value,
        Email: document.getElementById('Email').value.trim(),
        // Enrollment Details
        Academic_year: document.getElementById('Academic_year').value.trim(),
        Semester: document.getElementById('Semester').value,
        Current_year_level: document.getElementById('Current_year_level').value,
        Enrollment_type: document.getElementById('Enrollment_type').value,
        Gender: document.getElementById('Gender').value,
        Section_id: document.getElementById('Section_id').value,
        // Information
        Contact_num: document.getElementById('Contact_num').value.trim(),
        Emergency_contact_name: document.getElementById('Emergency_contact_name').value.trim(),
        Current_address: document.getElementById('Current_address').value.trim(),
        Student_password: document.getElementById('Student_password').value,
        Emergency_contact_num: document.getElementById('Emergency_contact_num').value.trim()
    };

    try {
        const response = await fetch('/profileManagement/addStudent', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            if (handleAuthError(response.status)) return;
            alert(data.error || 'Failed to add student. Please try again.');
            return;
        }

        // Success: close modal, reset form, refresh table
        alert('Student added successfully!');
        closeModal('addModal');
        document.querySelector('#addStudent_form').reset();
        loadStudents();
    } catch (err) {
        console.error(err);
        alert('An error occurred while adding the student. Please try again.');
    }
});

// ---------- EDIT STUDENT FORM SUBMISSION ----------
document.querySelector('#editStudent_form').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!currentEditId) return;

    const payload = {
        // Student Information
        Id_number: document.getElementById('editId_number').value.trim(),
        Full_name: document.getElementById('editFullName').value.trim(),
        Course: document.getElementById('editCourse').value,
        Email: document.getElementById('editEmail').value.trim(),
        // Enrollment Details
        Academic_year: document.getElementById('editAcademic_year').value.trim(),
        Semester: document.getElementById('editSemester').value,
        Current_year_level: document.getElementById('editCurrent_year_level').value,
        Enrollment_type: document.getElementById('editEnrollment_type').value,
        Gender: document.getElementById('editGender').value,
        Section_id: document.getElementById('editSection_id').value,
        // Information
        Contact_num: document.getElementById('editContact_num').value.trim(),
        Emergency_contact_name: document.getElementById('editEmergency_contact_name').value.trim(),
        Current_address: document.getElementById('editCurrent_address').value.trim(),
        Status: document.getElementById('editStatus').value,
        Emergency_contact_num: document.getElementById('editEmergency_contact_num').value.trim(),
        Student_password: document.getElementById('editPassword').value
    };

    try {
        const response = await fetch(`/profileManagement/updateStudent/${currentEditId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            if (handleAuthError(response.status)) return;
            alert(data.error || 'Failed to update student. Please try again.');
            return;
        }

        // Success: close modal, refresh table
        alert('Student updated successfully!');
        closeModal('editModal');
        currentEditId = null;
        loadStudents();
    } catch (err) {
        console.error(err);
        alert('An error occurred while updating the student. Please try again.');
    }
});
