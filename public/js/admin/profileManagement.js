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
    // Handle mock submit actions
    // document.querySelectorAll('.btn-submit').forEach(btn => {
    //     btn.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         const modal = e.target.closest('.modal-overlay');
    //         if (modal) {
    //             closeModal(modal.id);
    //         }
    //         alert('Action submitted successfully! (Mock)');
    //     });
    // });

    const confirmDeleteBtn = document.querySelector('.btn-confirm-delete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            closeModal('deleteModal');
            alert('Account Deleted! (Mock)');
        });
    }
});
(async()=>{
    try{
        const response = await fetch('/profileManagement/displayStudents', {
            credentials : 'include'
        })
        if(!response.ok){
            if(response.status == 401 || response.status == 403){
                window.location.href = "/pages/login.html";
                return;
            }
        }
        const data = await response.json()
        
        const tableBody = document.querySelector('#students_table');
        tableBody.innerHTML = data.students.map(student =>
            `
            <tr>
                <td>${student.First_name}</td>
                <td>${student.Email}</td>
                <td>${student.Course}</td>
                <td>${student.Current_year_level}</td>
                <td class="status-active">${student.Status}</td>
                <td class="actions">
                    <button class="btn-action btn-edit" onclick="openEditModal(${student.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-action btn-delete" onclick="openDeleteModal(${student.id})"><i class="fas fa-trash-alt"></i> Delete</button>
                </td>
            </tr>
        `
        ).join('');
        // for(let student of data.students){
        //     tableBody.innerHTML += `
        //             <tr>    
        //                     <td>${student.First_name}</td>
        //                     <td>${student.Email}</td>
        //                     <td>IT Department</td>
        //                     <td>1ST YEAR</td>
        //                     <td class="status-active">Active</td>
        //                     <td class="actions">
        //                         <button class="btn-action btn-edit" onclick="openEditModal()"><i class="fas fa-edit"></i> Edit</button>
        //                         <button class="btn-action btn-delete" onclick="openDeleteModal()"><i class="fas fa-trash-alt"></i> Delete</button>
        //                     </td>
        //                 </tr>
        //     `
        // }
    }catch(err){
        console.error(err)
    }
})();