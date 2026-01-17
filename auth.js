document.addEventListener('DOMContentLoaded', async () => {
    // --- CONFIGURATION ---
    const SUPABASE_URL = 'https://mziwlmwwjbamghcumtts.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_3F-Dytp7y7wHjCl-Z4QPow_13f5um3u';

    // Initialize Supabase
    if (typeof supabase === 'undefined') {
        console.error('Supabase client not loaded.');
    } else {
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        const loginForm = document.getElementById('loginForm');
        const errorMsg = document.getElementById('errorMsg');

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();

                errorMsg.style.display = 'none';

                try {
                    // Real Authentication Logic
                    const { data, error } = await client
                        .from('users')
                        .select('*')
                        .eq('username', username)
                        .eq('password', password)
                        .single();

                    if (error || !data) {
                        throw new Error("Invalid Username or Password");
                    }

                    // Store user details
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('userName', data.name || data.username);
                    localStorage.setItem('userSubDistrict', data.sub_district || '');

                    // Redirect based on role
                    if (data.role === 'admin') {
                        window.location.href = 'admin_dashboard.html';
                    } else if (data.role === 'teacher') {
                        window.location.href = 'teacher_dashboard.html';
                    } else {
                        throw new Error("Unauthorized role");
                    }
                }
                catch (err) {
                    errorMsg.textContent = err.message;
                    errorMsg.style.display = 'block';
                }
            });
        }
    }

    // Logout Functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
});
