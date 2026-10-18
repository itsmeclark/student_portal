(async ()=> {
    try{
        const response = await fetch('/admin/dashboard', {
            credentials : 'include'
        })

        if(!response.ok){
            if (response.status === 401 || response.status === 403) {
            window.location.href = "/pages/index.html";
            return;
            }
            throw new Error(`Request failed: ${response.status}`);
        }
        const data = await response.json()
        alert(data)

    }
    catch(err){
        console.log(err)
    }
})()
document.querySelector('#logoutButton').addEventListener('click', async (e) => {
    // Prevent the empty link from reloading the page mid-logout
    e.preventDefault();
    try{
        const response = await fetch('/auth/admin/logout', {
            method : 'POST',
            credentials : "include"
    })
        if(response.ok){
            console.log()
            window.location.href = '/pages/index.html'
        }else{
            alert('LOGOUT FAILED. Please try again')
        }
    }catch(err){
        console.error(err)
    }
})