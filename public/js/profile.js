// =================================================================
// PROFILE PAGE: layout, nav highlight, logout and Change Password modal
// (profile-data.js loads the data, contact editing and the photo)
// =================================================================

const LOGIN_PAGE = '/pages/login.html';
const frame = document.getElementById('frame');

function fit() {
    const s = Math.min(1, window.innerWidth / 1440);
    frame.style.zoom = s;
}

fit();
window.addEventListener('resize', fit);

// Sends the saved token too (if there is one). The login cookie is sent automatically.
function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return token ? { ...extra, Authorization: 'Bearer ' + token } : extra;
}

// ---------------- Nav highlight ----------------
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();

    document.querySelectorAll('.navigation .nav-item').forEach(function (item) {
        const href = item.getAttribute('href');
        item.classList.remove('active');
        item.removeAttribute('aria-current');

        if (!href || href === '#') return;

        if (href.split('/').pop().toLowerCase() === currentPage) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        }
    });
});

// ---------------- Logout ----------------
async function logout() {
    try {
        await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
        console.error('Logout error:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('student_id');
    localStorage.removeItem('role');
    window.location.href = LOGIN_PAGE;
}

const logoutBtn = document.querySelector('header .logout');
if (logoutBtn) logoutBtn.addEventListener('click', logout);

// ---------------- Change Password modal ----------------
const ov = document.getElementById('ov');
const msg = document.getElementById('msg');
const saveBtn = document.getElementById('save');

const ids = ['cur', 'nw', 'cf'].map(function (id) {
    return document.getElementById(id);
});

function openPw() {
    ids.forEach(function (input) {
        input.value = '';
    });
    msg.textContent = '';
    msg.className = 'msg';
    ov.classList.add('open');
    ids[0].focus();
}

function closePw() {
    ov.classList.remove('open');
}

document.getElementById('openPw').onclick = openPw;
document.getElementById('closePw').onclick = closePw;

ov.addEventListener('click', function (e) {
    if (e.target === ov) closePw();
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePw();
});

saveBtn.onclick = async function () {
    const [currentPassword, newPassword, confirmPassword] = ids.map(function (input) {
        return input.value;
    });

    msg.className = 'msg err';

    // Quick checks in the browser (the server checks all of these again)
    if (!currentPassword || !newPassword || !confirmPassword) {
        msg.textContent = 'Please fill in all three fields.';
        return;
    }
    if (newPassword.length < 8) {
        msg.textContent = 'New password must be at least 8 characters.';
        return;
    }
    if (!/\d/.test(newPassword)) {
        msg.textContent = 'New password must contain at least one number.';
        return;
    }
    if (newPassword !== confirmPassword) {
        msg.textContent = 'New passwords do not match.';
        return;
    }
    if (newPassword === currentPassword) {
        msg.textContent = 'New password must be different from the current one.';
        return;
    }

    saveBtn.disabled = true;
    msg.className = 'msg';
    msg.textContent = 'Saving...';

    try {
        const res = await fetch('/api/profile/me/password', {
            method: 'PUT',
            credentials: 'include',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });
        const data = await res.json().catch(function () { return {}; });

        if (res.status === 401 || res.status === 403) {
            alert('Your session has expired. Please log in again.');
            window.location.href = LOGIN_PAGE;
            return;
        }
        if (!res.ok) {
            msg.className = 'msg err';
            msg.textContent = data.error || 'Could not change password.';
            return;
        }

        msg.className = 'msg ok';
        msg.textContent = 'Password changed.';
        setTimeout(closePw, 1200);
    } catch (err) {
        msg.className = 'msg err';
        msg.textContent = 'Server not reachable.';
    } finally {
        saveBtn.disabled = false;
    }
};
