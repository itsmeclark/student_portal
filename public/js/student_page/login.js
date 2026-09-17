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
})