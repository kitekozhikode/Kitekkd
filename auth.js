document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            errorMsg.style.display = 'none';

            // Mock Authentication Logic
            if (username === 'admin' && password === 'admin123') {
                // Admin Login
                localStorage.setItem('userRole', 'admin');
                window.location.href = 'admin_dashboard.html';
            }
            else if (username === 'teacher' && password === 'teacher123') {
                // Teacher Login
                localStorage.setItem('userRole', 'teacher');
                window.location.href = 'teacher_dashboard.html';
            }
            else {
                // Invalid
                errorMsg.textContent = "Invalid Username or Password";
                errorMsg.style.display = 'block';
            }
        });
    }

    // Logout Functionality (for Dashboards)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'login.html';
        });
    }
});
