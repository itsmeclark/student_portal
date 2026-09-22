document.querySelector('#loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const Idnumber = document.querySelector('#Idnumber').value;
    const password = document.querySelector('#password').value;
    console.log(Idnumber, password)
    const userData = {
        Idnumber :Idnumber,
        password : password
    };

    try{
        const response = await fetch('/auth/login', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })

        const data = await response.json();
        
        if (response.ok) {
            window.location.href = '/pages/students_page/home.html'
        } else {
            alert(data.error || 'Login failed. Please try again.');
        }
    }catch(error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again later.');
    }

})
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch("/auth/protected");
        
        const data = await response.json();
        if(data.isLoggedIn) {
            window.location.href = '/pages/students_page/home.html'
            console.log('User is logged in:', data.user);
        }
    }catch (error) {
        console.error('Error checking authentication:', error);
    }
});
// (async ()=>{
//     try{
//         const response = await fetch('/auth/admin/protected', {
//             credentials : 'include'
//         })
//         const data = await response.json()
//         if(data.isLoggedIn){
//             window.location.href = '/pages/admin/adminDashboard.html'
//             return;
//         }
//     }catch(err){
//         console.log(err)
//     }
// })()
(function() {
            'use strict';

            // Get elements
            const popup = document.getElementById('rolePopup');
            const roleCards = document.querySelectorAll('.role-card');
            const continueBtn = document.getElementById('continueBtn');
            const loginForm = document.getElementById('loginForm');

            let selectedRole = null;

            // --- make sure popup is visible on page load (it is by default) ---
            // but if any cookie/localStorage logic would hide it, we force show
            popup.classList.remove('hidden');

            // --- role card selection ---
            roleCards.forEach(card => {
                card.addEventListener('click', function(e) {
                    // remove selected class from all
                    roleCards.forEach(c => c.classList.remove('selected'));
                    // add selected to clicked
                    this.classList.add('selected');
                    // store role
                    selectedRole = this.dataset.role;
                    // enable continue button
                    continueBtn.disabled = false;
                    // update note text (optional)
                    const note = document.querySelector('.popup-note');
                    if (note) {
                        note.textContent = `Selected: ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`;
                    }
                });
            });

            // --- continue button click: close popup ---
            continueBtn.addEventListener('click', function() {
                if (!selectedRole) {
                    return;
                }

                try {
                    sessionStorage.setItem('selectedRole', selectedRole);
                } catch (e) {
                    // Ignore storage errors
                }

                if (selectedRole === 'admin') {
                    window.location.href = '/pages/admin.login.html';
                    return;
                }

                // Student: close the popup and remain on the student login page
                popup.classList.add('hidden');
                popup.style.display = 'none';
            });

            // --- if user clicks outside popup, do nothing (they must choose) ---
            // but we can prevent accidental closing to enforce selection
            popup.addEventListener('click', function(e) {
                if (e.target === popup) {
                    // optional: slight shake or just ignore
                    // we do nothing so they must pick a role
                }
            });

            // --- optional: if there is a previously selected role, restore? Not needed ---
            // but we make sure the popup stays open until continue is pressed.

            // --- handle form submit: if popup is still visible, prevent login? (no, user might submit after closing) ---
            // we don't interfere with form; the popup is just a welcome overlay.

            // --- ensure popup appears on each visit (if you want it every time) ---
            // It's shown by default. If you want to hide after first visit, you could use sessionStorage,
            // but requirement says "when this login.html got visited this thing will pop up"
            // so we always show it. We also don't hide on load.
            // However if the user navigates back, it will show again (fine).

            // --- small accessibility: if user presses Escape, don't close (force choice)
            // but we can allow closing if they click the X, but we didn't include an X.
            // So they must select a role. That's fine.

            // --- Set default selected (none) and button disabled.
            // But for better UX, we could pre-select Student? The requirement doesn't specify.
            // But the screenshot shows both unselected, so we keep disabled.

            // --- Edge: if user somehow submits form while popup open? form is behind overlay,
            // so they can't click. So it's fine.

            // --- Also, we need to ensure that the popup is above everything,
            // and that the login form is not interactable while open.
            // Our CSS overlay uses fixed position and z-index, so it blocks clicks.

            // --- if user had previously selected (e.g., from a fast refresh) we might re-enable?
            // Not needed.

            // --- Reset selectedRole if needed (no)
            // Also add a small animation when selecting a role
        })();