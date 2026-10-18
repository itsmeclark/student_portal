document.addEventListener('DOMContentLoaded', () => {
    console.log("Auth script loaded successfully!");

    const rolePopup = document.getElementById('rolePopup');
    const roleCards = document.querySelectorAll('.role-card');
    const continueBtn = document.getElementById('continueBtn');
    const loginForm = document.getElementById('loginForm');
    
    let selectedRole = 'student';

    roleCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            console.log(`Card ${index} clicked! Role:`, card.getAttribute('data-role'));
            
            roleCards.forEach(c => c.classList.remove('selected', 'active'));
            card.classList.add('selected', 'active');
            selectedRole = card.getAttribute('data-role');
            
            if (continueBtn) {
                continueBtn.removeAttribute('disabled');
            }
        });
    });

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            if (rolePopup) {
                rolePopup.style.display = 'none';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idNumberInput = document.getElementById('Idnumber');
            const passwordInput = document.getElementById('password');

            if (!idNumberInput || !passwordInput) {
                console.error("Login form input fields not found.");
                return;
            }

            const idNumber = idNumberInput.value.trim();
            const password = passwordInput.value;

            try {
                // Using relative or fallback API URL configuration to support teamwork environments
                const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                    ? 'http://localhost:3000/auth/login' 
                    : '/auth/login';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        Idnumber: idNumber,
                        password: password,
                        role: selectedRole
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                    localStorage.setItem('role', selectedRole);
                    
                    // Store the student ID so the dashboard can fetch their specific details safely
                    localStorage.setItem('student_id', idNumber);

                    // Use relative pathing configuration for navigation redirection
                    if (selectedRole === 'admin') {
                        window.location.href = '../admin/admin_dashboard.html';
                    } else {
                        window.location.href = './students_page/home.html';
                    }
                } else {
                    alert(data.message || 'Invalid credentials');
                }
            } catch (error) {
                console.error('Error during login connection:', error);
                alert('Unable to connect to the backend server. Please make sure the server is running.');
            }
        });
    }
});