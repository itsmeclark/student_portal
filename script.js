let students = [];
let selectedEditIndex = null;
let selectedDeleteIndex = null;

// DOM ELEMENTS
const appContainer = document.getElementById("appContainer");
const menuBtn = document.getElementById("menuBtn");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const table = document.getElementById("studentTable");
const studentModal = document.getElementById("studentModal");
const deleteModal = document.getElementById("deleteModal");
const topAddBtn = document.getElementById("topAddStudentBtn");
const bottomAddBtn = document.getElementById("bottomAddStudentBtn");
const closeModal = document.getElementById("closeModal");
const cancelForm = document.getElementById("cancelForm");
const form = document.getElementById("studentForm");
const search = document.getElementById("search");
const modalTitle = document.getElementById("modalTitle");
const submitBtn = document.getElementById("submitBtn");
const formFooterNote = document.getElementById("formFooterNote");

const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

// TOGGLE SIDEBAR
function toggleSidebar() {
  appContainer.classList.toggle("sidebar-open");
}

menuBtn.addEventListener("click", toggleSidebar);
sidebarToggleBtn.addEventListener("click", toggleSidebar);

// DISPLAY STUDENTS IN TABLE
function displayStudents(data = students) {
  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No student records found.</td>
      </tr>
    `;
    return;
  }

  data.forEach((student, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="student-info">
          <img class="student-avatar" src="${student.avatar || 'https://i.pravatar.cc/150'}" alt="avatar">
          <span>${student.name}</span>
        </div>
      </td>
      <td>${student.email}</td>
      <td>${student.department}</td>
      <td>${student.year}</td>
      <td class="status">${student.status}</td>
      <td>
        <button class="edit" onclick="openEditModal(${index})">✎ Edit</button>
        <button class="delete" onclick="openDeleteModal(${index})">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

// MODAL CONTROLS
function openAddModal() {
  selectedEditIndex = null;
  modalTitle.innerHTML = `<i class="fa-solid fa-file-pen"></i> ADD STUDENT`;
  submitBtn.textContent = "ADD STUDENT";
  formFooterNote.classList.remove("hidden");
  cancelForm.classList.add("hidden");
  form.reset();
  studentModal.classList.add("show");
}

function openEditModal(index) {
  selectedEditIndex = index;
  const student = students[index];

  modalTitle.innerHTML = `<i class="fa-solid fa-pen"></i> EDIT STUDENT INFORMATION`;
  submitBtn.textContent = "UPDATE STUDENT INFORMATION";
  formFooterNote.classList.add("hidden");
  cancelForm.classList.remove("hidden");

  document.getElementById("studentId").value = student.id || "";
  document.getElementById("fullName").value = student.name || "";
  document.getElementById("program").value = student.program || "";
  document.getElementById("email").value = student.email || "";
  document.getElementById("yearLevel").value = student.year || "1ST YEAR";
  document.getElementById("contact").value = student.contact || "";
  document.getElementById("emergencyName").value = student.emergencyName || "";
  document.getElementById("address").value = student.address || "";
  document.getElementById("emergencyContact").value = student.emergencyContact || "";
  document.getElementById("status").value = student.status || "Active";

  studentModal.classList.add("show");
}

function closeStudentModal() {
  studentModal.classList.remove("show");
}

topAddBtn.addEventListener("click", openAddModal);
bottomAddBtn.addEventListener("click", openAddModal);
closeModal.addEventListener("click", closeStudentModal);
cancelForm.addEventListener("click", closeStudentModal);

studentModal.addEventListener("click", (event) => {
  if (event.target === studentModal) closeStudentModal();
});

// FORM SUBMISSION
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const yearLevel = document.getElementById("yearLevel").value;
  const program = document.getElementById("program").value;
  const status = document.getElementById("status").value;

  let department = "IT Department";
  if (program.includes("Hospitality") || program.includes("Tourism")) {
    department = "HTM Department";
  } else if (program.includes("Criminology")) {
    department = "CRIM Department";
  }

  const payload = {
    id: document.getElementById("studentId").value,
    name: fullName,
    email: email,
    department: department,
    program: program,
    year: yearLevel,
    status: status,
    contact: document.getElementById("contact").value,
    emergencyName: document.getElementById("emergencyName").value,
    address: document.getElementById("address").value,
    emergencyContact: document.getElementById("emergencyContact").value,
    avatar: selectedEditIndex !== null ? students[selectedEditIndex].avatar : `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`
  };

  if (selectedEditIndex !== null) {
    students[selectedEditIndex] = payload;
  } else {
    students.push(payload);
  }

  displayStudents();
  closeStudentModal();
});

// DELETE MODAL CONTROLS
function openDeleteModal(index) {
  selectedDeleteIndex = index;
  deleteModal.classList.add("show");
}

function closeDeleteModal() {
  deleteModal.classList.remove("show");
  selectedDeleteIndex = null;
}

confirmDeleteBtn.addEventListener("click", () => {
  if (selectedDeleteIndex !== null) {
    students.splice(selectedDeleteIndex, 1);
    displayStudents();
    closeDeleteModal();
  }
});

cancelDeleteBtn.addEventListener("click", closeDeleteModal);

deleteModal.addEventListener("click", (event) => {
  if (event.target === deleteModal) closeDeleteModal();
});

// SEARCH FUNCTIONALITY
search.addEventListener("input", () => {
  const keyword = search.value.toLowerCase();
  const filtered = students.filter(student =>
    student.name.toLowerCase().includes(keyword) ||
    student.email.toLowerCase().includes(keyword) ||
    student.department.toLowerCase().includes(keyword) ||
    student.year.toLowerCase().includes(keyword)
  );
  displayStudents(filtered);
});

// LOGOUT HANDLER
document.getElementById("logoutBtn").addEventListener("click", () => {
  alert("Logged out successfully.");
});

// INITIAL RENDER
displayStudents();