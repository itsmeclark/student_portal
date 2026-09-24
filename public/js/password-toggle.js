// Show/Hide password toggles — reusable across the whole portal.
// Markup:
//   <button type="button" class="password-toggle" data-password-toggle="inputId"
//           aria-label="Show password" aria-pressed="false"><i class="fa-solid fa-eye"></i></button>
// Wire up ANY password field by giving the button the input's id in data-password-toggle.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-password-toggle]').forEach((button) => {
        const input = document.getElementById(button.getAttribute('data-password-toggle'));
        if (!input) return;

        button.addEventListener('click', () => {
            const currentlyShowing = input.type === 'text';

            // Flip visibility
            input.type = currentlyShowing ? 'password' : 'text';

            // Swap the eye icon
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye', currentlyShowing);
                icon.classList.toggle('fa-eye-slash', !currentlyShowing);
            }

            // Keep accessibility state in sync
            button.setAttribute('aria-pressed', String(!currentlyShowing));
            button.setAttribute('aria-label', currentlyShowing ? 'Show password' : 'Hide password');
        });
    });
});
