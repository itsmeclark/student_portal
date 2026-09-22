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

    // Function to open Edit Modal (attached to buttons in HTML via onclick)
    window.openEditModal = function() {
        openModal('editModal');
    }

    // Function to open Delete Modal (attached to buttons in HTML via onclick)
    window.openDeleteModal = function() {
        openModal('deleteModal');
    }

    // Close modals when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    const confirmDeleteBtn = document.querySelector('.btn-confirm-delete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            closeModal('deleteModal');
            alert('Account Deleted! (Mock)');
        });
    }
});

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

// ---------- LOAD SECTION DROPDOWN FROM DATABASE ----------
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
        const select = document.getElementById('Section_id');
        if (!select) return;

        // Keep the placeholder, rebuild options from DB
        select.innerHTML = '<option value="">Select Section</option>' +
            data.sections.map(section => `
                <option value="${section.Section_id}">${section.Section_program}</option>
            `).join('');
    } catch (err) {
        console.error(err);
    }
}

loadStudents();
loadSections();

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
