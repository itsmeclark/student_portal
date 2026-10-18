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

            const idNumber = document.getElementById('Idnumber').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/auth/login', {
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
                    
                    // STEP 1: Store the student ID so the dashboard can fetch their specific details
                    localStorage.setItem('student_id', idNumber);

                    alert('Login successful!');

                    if (selectedRole === 'admin') {
                        window.location.href = '../admin/admin_dashboard.html';
                    } else {
                        window.location.href = './students_page/home.html';
                    }
                } else {
                    alert(data.message || 'Invalid credentials');
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login.');
            }
        });
    }
});