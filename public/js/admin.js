document.querySelector('#adminLoginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const adminName = document.querySelector('#fullName').value;
    const password = document.querySelector('#adminPassword').value;
    const adminData = {
        adminName: adminName,
        password: password
    };

    try {
        const response = await fetch('/auth/admin/login', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adminData)
        })

        const data = await response.json();

        if (response.ok) {
            window.location.href = '/pages/admin/adminDashboard.html';
        } else {
            alert(data.error || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during admin login:', error);
        alert('An error occurred during login. Please try again later.');
    }
});
(async ()=>{
    try{
        const response = await fetch('/auth/admin/protected', {
            credentials : 'include'
        })
        const data = await response.json()
        if(data.isLoggedIn){
            window.location.href = '/pages/admin/adminDashboard.html'
            return;
        }
    }catch(err){
        console.log(err)
    }
})()