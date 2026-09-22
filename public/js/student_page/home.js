const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

let greetingsElement = document.getElementById("greetings");
let studentNameElement = document.getElementById("student_name");
let studentCourseElement = document.getElementById("student_course");
let studentIdElement = document.getElementById("student_id");
let studentYearLevelElement = document.getElementById("student_year_level");


// Function to open sidebar
menuToggle.addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("active");
});

// Function to close sidebar when clicking overlay
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
});

// Optional: Close sidebar when pressing the Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }
});
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      window.location.href = "../login.html"; // Redirect to login page after logout
    } else {
      alert("Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
});
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/home/dashboard", {
      credentials: "include",
    });

    if (!response.ok) {
      // 401/403 → not logged in, or 500 → server error
      if (response.status === 401 || response.status === 403) {
        window.location.href = "/pages/login.html";
        return;
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("User:", data);
    // render data.user on the page
    greetingsElement.textContent = `WELCOME BACK, ${data.user.First_name.toUpperCase()}!`;
    studentNameElement.innerHTML = `<span>Name:</span> ${data.user.First_name} ${data.user.Last_name}`;
    studentCourseElement.innerHTML = `<span>Course:</span> ${data.user.Course}`;
    studentIdElement.innerHTML = `<span>ID:</span> ${data.user.Id_number}`;
    studentYearLevelElement.innerHTML = `<span>Year Level:</span> ${data.user.Current_year_level}`;
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
});
