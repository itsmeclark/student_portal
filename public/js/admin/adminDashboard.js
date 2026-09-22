(function() {
            'use strict';

            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            const burgerBtn = document.getElementById('burgerBtn');
            const mainContent = document.getElementById('mainContent');

            // Toggle sidebar
            function toggleSidebar() {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
                document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
            }

            // Close sidebar
            function closeSidebar() {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }

            // Burger click
            burgerBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleSidebar();
            });

            // Overlay click
            overlay.addEventListener('click', function() {
                closeSidebar();
            });

            // Close on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                    closeSidebar();
                }
            });

            // Close sidebar when clicking a nav item on mobile
            const navItems = sidebar.querySelectorAll('.nav-item');
            navItems.forEach(function(item) {
                item.addEventListener('click', function() {
                    if (window.innerWidth <= 1024) {
                        closeSidebar();
                    }
                });
            });

            // Handle resize: if window > 1024, ensure sidebar is visible and overlay hidden
            function handleResize() {
                if (window.innerWidth > 1024) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }

            window.addEventListener('resize', handleResize);

            // Initial check
            handleResize();

        })();

(async ()=> {
    try{
        const response = await fetch('/admin/dashboard', {
            credentials : 'include'
        })

        if(!response.ok){
            if (response.status === 401 || response.status === 403) {
            window.location.href = "/pages/login.html";
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
document.querySelector('.sidebar-logout').addEventListener('click', async () => {
    try{
        const response = await fetch('/auth/admin/logout', {
            method : 'POST',
            credentials : "include"
    })
        if(response.ok){
            console.log()
            window.location.href = '/pages/admin.login.html'
        }else{
            alert('LOGOUT FAILED. Please try again')
        }
    }catch(err){
        console.error(err)
    }
})