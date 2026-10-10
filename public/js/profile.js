const frame = document.getElementById('frame');

function fit() {
    const s = Math.min(1, window.innerWidth / 1440);
    frame.style.zoom = s;
}

fit();
window.addEventListener('resize', fit);


document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname
        .split('/')
        .pop()
        .toLowerCase();

    const navItems = document.querySelectorAll(
        '.navigation .nav-item'
    );

    navItems.forEach(function (item) {
        const href = item.getAttribute('href');

        if (!href || href === '#') {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
            return;
        }

        const linkPage = href.split('/').pop().toLowerCase();

        item.classList.remove('active');
        item.removeAttribute('aria-current');

        if (linkPage === currentPage) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        }
    });
});


const ov = document.getElementById('ov');
const msg = document.getElementById('msg');

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
    if (e.target === ov) {
        closePw();
    }
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closePw();
    }
});


document.getElementById('save').onclick = function () {
    const [currentPassword, newPassword, confirmPassword] =
        ids.map(function (input) {
            return input.value;
        });

    msg.className = 'msg err';

    if (!currentPassword || !newPassword || !confirmPassword) {
        msg.textContent = 'Please fill in all three fields.';
        return;
    }

    if (newPassword.length < 8) {
        msg.textContent =
            'New password must be at least 8 characters.';
        return;
    }

    if (newPassword !== confirmPassword) {
        msg.textContent = 'New passwords do not match.';
        return;
    }

    msg.className = 'msg ok';
    msg.textContent = 'Password changed.';

    setTimeout(closePw, 1000);
};
