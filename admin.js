document.addEventListener('DOMContentLoaded', async () => {

    // --- CONFIGURATION ---
    const SUPABASE_URL = 'https://mziwlmwwjbamghcumtts.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_3F-Dytp7y7wHjCl-Z4QPow_13f5um3u';

    // Initialize Supabase
    // Check if supabase is available from the CDN
    if (typeof supabase === 'undefined') {
        console.error('Supabase client not loaded. Make sure the script tag is present in HTML.');
        return;
    }

    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- DOM ELEMENTS ---
    // --- UI ELEMENTS ---
    const sections = {
        home: document.getElementById('dashboard-home'),
        users: document.getElementById('section-users'),
        downloads: document.getElementById('section-downloads'),
        gallery: document.getElementById('section-gallery')
    };

    // Note: Buttons are now handled via inline onclick="showSection('...')" calls for simplicity in HTML

    // --- FUNCTIONS ---

    // Toggle Section
    window.showSection = function (sectionName) {
        // Hide all
        Object.values(sections).forEach(sec => {
            if (sec) sec.style.display = 'none';
        });

        // Show target
        if (sections[sectionName]) {
            sections[sectionName].style.display = 'block';
            sections[sectionName].scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 1. Fetch and Display Teachers
    async function fetchTeachers() {
        if (!teacherList) return;
        teacherList.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
        const { data, error } = await client.from('users').select('*').eq('role', 'teacher').order('id', { ascending: false });
        if (error) {
            console.error('Error:', error);
            teacherList.innerHTML = '<tr><td colspan="4" style="color:red;">Error loading teachers</td></tr>';
            return;
        }
        renderTeachers(data);
    }

    function renderTeachers(teachers) {
        teacherList.innerHTML = '';
        if (!teachers || teachers.length === 0) {
            teacherList.innerHTML = '<tr><td colspan="4">No teachers found.</td></tr>';
            return;
        }
        teachers.forEach(teacher => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${teacher.name || 'N/A'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${teacher.username}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${teacher.sub_district || 'None'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><span style="color: green;">Active</span></td>
            `;
            teacherList.appendChild(tr);
        });
    }

    // New: Fetch unique sub-districts from school_charges
    async function fetchSubDistricts() {
        const select = document.getElementById('new_sub_district');
        if (!select) return;

        let allData = [];
        let from = 0;
        let to = 999;
        let finished = false;

        while (!finished) {
            const { data, error } = await client
                .from('school_charges')
                .select('sub_district')
                .not('sub_district', 'is', null)
                .range(from, to);

            if (error) {
                console.error('Error fetching sub-districts:', error);
                break;
            }

            if (data && data.length > 0) {
                allData = allData.concat(data);
                if (data.length < 1000) {
                    finished = true;
                } else {
                    from += 1000;
                    to += 1000;
                }
            } else {
                finished = true;
            }
        }

        // Get unique sub-districts and trim them
        const uniqueSubDistricts = [...new Set(allData.map(item => item.sub_district.trim()))].sort();

        uniqueSubDistricts.forEach(sd => {
            const option = document.createElement('option');
            option.value = sd;
            option.textContent = sd;
            select.appendChild(option);
        });
    }

    // 2. Fetch and Display Downloads
    async function fetchDownloadsAdmin() {
        const list = document.getElementById('downloadsListAdmin');
        if (!list) return;
        list.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

        const { data, error } = await client.from('downloads').select('*').order('created_at', { ascending: false });

        if (error) {
            console.error('Error:', error);
            list.innerHTML = '<tr><td colspan="4" style="color:red;">Error loading downloads</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            list.innerHTML = '<tr><td colspan="4">No active downloads.</td></tr>';
            return;
        }

        list.innerHTML = '';
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(item.created_at).toLocaleDateString()}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.category}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <a href="${item.file_url}" target="_blank" style="color:blue;"><i class="fas fa-external-link-alt"></i></a>
                    <!-- Delete not implemented yet, but visual marker -->
                </td>
            `;
            list.appendChild(tr);
        });
    }

    // 3. Fetch and Display Gallery
    async function fetchGalleryAdmin() {
        const grid = document.getElementById('galleryGridAdmin');
        if (!grid) return;
        grid.innerHTML = 'Loading...';

        const { data, error } = await client.from('gallery').select('*').order('created_at', { ascending: false });

        if (error) {
            console.error('Error:', error);
            grid.innerHTML = 'Error loading gallery.';
            return;
        }

        if (!data || data.length === 0) {
            grid.innerHTML = 'No images found.';
            return;
        }

        grid.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('div');
            div.style.border = '1px solid #eee';
            div.style.borderRadius = '4px';
            div.style.overflow = 'hidden';
            div.innerHTML = `
                <img src="${item.image_url}" style="width:100%; height:100px; object-fit:cover;" title="${item.caption}">
                <div style="padding:5px; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.caption}</div>
            `;
            grid.appendChild(div);
        });
    }

    // --- FORM HANDLING ---

    // 1. Add Teacher
    if (addTeacherForm) {
        addTeacherForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new_name').value;
            const username = document.getElementById('new_user').value;
            const password = document.getElementById('new_pass').value;
            const sub_district = document.getElementById('new_sub_district').value;

            try {
                const { error } = await client.from('users').insert([{
                    name,
                    username,
                    password,
                    role: 'teacher',
                    sub_district: sub_district || null
                }]);
                if (error) throw error;
                alert('Teacher added successfully!');
                addTeacherForm.reset();
                fetchTeachers();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }

    // 2. Add Download
    const addDownloadForm = document.getElementById('addDownloadForm');
    if (addDownloadForm) {
        addDownloadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('dl_title').value;
            const description = document.getElementById('dl_desc').value;
            const file_url = document.getElementById('dl_url').value;
            const category = document.getElementById('dl_category').value;

            try {
                const { error } = await client.from('downloads').insert([{ title, description, file_url, category }]);
                if (error) throw error;
                alert('Download link added successfully!');
                addDownloadForm.reset();
                fetchDownloadsAdmin();
            } catch (error) {
                alert('Failed: ' + error.message);
            }
        });
    }

    // 3. Add Gallery
    const addGalleryForm = document.getElementById('addGalleryForm');
    if (addGalleryForm) {
        addGalleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const image_url = document.getElementById('gal_url').value;
            const caption = document.getElementById('gal_caption').value;

            try {
                const { error } = await client.from('gallery').insert([{ image_url, caption }]);
                if (error) throw error;
                alert('Image added to gallery!');
                addGalleryForm.reset();
                fetchGalleryAdmin();
            } catch (error) {
                alert('Failed: ' + error.message);
            }
        });
    }

    // --- INITIALIZATION ---
    fetchTeachers();
    fetchDownloadsAdmin();
    fetchGalleryAdmin();
    fetchSubDistricts();
});
