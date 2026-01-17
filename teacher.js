document.addEventListener('DOMContentLoaded', async () => {

    // --- CONFIGURATION ---
    const SUPABASE_URL = 'https://mziwlmwwjbamghcumtts.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_3F-Dytp7y7wHjCl-Z4QPow_13f5um3u';

    // Initialize Supabase
    if (typeof supabase === 'undefined') {
        console.error('Supabase client not loaded.');
        return;
    }

    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- DOM ELEMENTS ---
    const welcomeUser = document.getElementById('welcomeUser');
    const subDistrictTitle = document.getElementById('subDistrictTitle');
    const schoolCardContainer = document.getElementById('schoolCardContainer');
    const schoolSearch = document.getElementById('schoolSearch');
    const noResults = document.getElementById('noResults');

    const sections = {
        home: document.getElementById('dashboard-home'),
        schools: document.getElementById('section-schools')
    };

    // --- DATA STATE ---
    let allSchools = [];
    const userName = localStorage.getItem('userName') || 'Teacher';
    const userRole = localStorage.getItem('userRole');
    const userSubDistrict = localStorage.getItem('userSubDistrict') || '';

    if (userRole !== 'teacher') {
        window.location.href = 'login.html';
        return;
    }

    // Set Welcome Text
    if (welcomeUser) welcomeUser.textContent = `Welcome, ${userName}`;
    if (subDistrictTitle) subDistrictTitle.textContent = userSubDistrict || 'No Sub-district Assigned';

    // --- EVENT LISTENERS ---
    if (schoolSearch) {
        schoolSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            filterAndRenderSchools(term);
        });
    }

    // --- FUNCTIONS ---

    // --- MODAL ELEMENTS ---
    const editSchoolModal = document.getElementById('editSchoolModal');
    const editSchoolForm = document.getElementById('editSchoolForm');
    const toastContainer = document.getElementById('toast-container');
    const subDistrictFilters = document.getElementById('subDistrictFilters');

    // New Containers for Tile View
    const districtTileContainer = document.getElementById('districtTileContainer');
    const schoolSearchContainer = document.getElementById('schoolSearchContainer');
    const schoolResultsContainer = document.getElementById('schoolResultsContainer');
    const schoolViewNavigation = document.getElementById('schoolViewNavigation');

    let currentSubDistrictFilter = 'All';

    // --- FUNCTIONS ---

    window.showSection = function (sectionName) {
        Object.values(sections).forEach(sec => {
            if (sec) sec.style.display = 'none';
        });

        if (sections[sectionName]) {
            sections[sectionName].style.display = 'block';
            if (sectionName === 'home') {
                // Reset to tile view when returning to home/navigating back
                showDistricts();
            }
            if (sectionName === 'schools' && allSchools.length === 0) {
                fetchSchools();
            } else if (sectionName === 'schools') {
                showDistricts();
            }
        }
    };

    // Sub-District Tile Rendering
    window.renderDistrictTiles = function () {
        if (!districtTileContainer) return;

        // Count schools per district
        const counts = allSchools.reduce((acc, s) => {
            if (s.sub_district) acc[s.sub_district] = (acc[s.sub_district] || 0) + 1;
            return acc;
        }, {});

        const subDistricts = Object.keys(counts).sort();

        // Use the existing services-grid style
        districtTileContainer.className = 'services-grid';

        // Add "All Schools" option + Sub-Districts as premium cards
        districtTileContainer.innerHTML = `
            <div class="service-card" onclick="handleFilterClick('All')" style="cursor: pointer;">
                <div class="icon-circle" style="background: #e3f2fd; color: var(--primary-blue);">
                    <i class="fas fa-globe-asia"></i>
                </div>
                <h3>All Schools</h3>
                <p>${allSchools.length} Schools available</p>
                <span style="color: var(--primary-blue); font-weight: bold; font-size: 13px;">Explore All <i class="fas fa-arrow-right"></i></span>
            </div>
        ` + subDistricts.map(sd => `
            <div class="service-card" onclick="handleFilterClick('${sd}')" style="cursor: pointer;">
                <div class="icon-circle" style="background: #f0f7ff; color: var(--primary-blue);">
                    <i class="fas fa-map-location-dot"></i>
                </div>
                <h3>${sd}</h3>
                <p>${counts[sd]} Schools in area</p>
                <span style="color: var(--primary-blue); font-weight: bold; font-size: 13px;">View Schools <i class="fas fa-arrow-right"></i></span>
            </div>
        `).join('');

        // Show Tiles, Hide Search/Results
        districtTileContainer.style.display = 'grid';
        schoolSearchContainer.style.display = 'none';
        schoolResultsContainer.style.display = 'none';
        schoolViewNavigation.style.display = 'none';
    };

    window.showDistricts = function () {
        renderDistrictTiles();
    };

    // Sub-District Filters
    function renderSubDistrictFilters() {
        if (!subDistrictFilters) return;

        const subDistricts = ['All', ...new Set(allSchools.map(s => s.sub_district).filter(Boolean))].sort();

        subDistrictFilters.innerHTML = subDistricts.map(sd => `
            <div class="filter-chip ${currentSubDistrictFilter === sd ? 'active' : ''}" 
                 onclick="handleFilterClick('${sd}')">
                ${sd}
            </div>
        `).join('');
    }

    window.handleFilterClick = function (subDistrict) {
        currentSubDistrictFilter = subDistrict;
        // renderSubDistrictFilters(); // Removed redundant list

        // Show Search and Results, Hide Tiles
        districtTileContainer.style.display = 'none';
        schoolSearchContainer.style.display = 'block';
        schoolResultsContainer.style.display = 'block';
        schoolViewNavigation.style.display = 'block';

        // Update title
        document.getElementById('schoolSearchTitle').textContent =
            subDistrict === 'All' ? 'All Schools' : `Schools in ${subDistrict}`;

        // Re-apply search term with new filter
        const searchTerm = document.getElementById('schoolSearch').value.toLowerCase();
        filterAndRenderSchools(searchTerm);
    };

    // Modal Control
    window.openEditModal = function (schoolCode) {
        const school = allSchools.find(s => s.school_code === schoolCode);
        if (!school) return;

        document.getElementById('editSchoolCode').value = school.school_code;
        document.getElementById('editHmName').value = school.name_of_hm || '';
        document.getElementById('editHmPhone').value = school.number_of_hm || '';
        document.getElementById('editSitcName').value = school.name_of_sitc_psitc || '';
        document.getElementById('editSitcPhone').value = school.number_of_sitc_psitc || '';

        editSchoolModal.style.display = 'flex';
    };

    window.closeEditModal = function () {
        editSchoolModal.style.display = 'none';
    };

    // Toast Notifications
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Form Submission
    if (editSchoolForm) {
        editSchoolForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const schoolCode = document.getElementById('editSchoolCode').value;
            const hmName = document.getElementById('editHmName').value;
            const hmPhone = document.getElementById('editHmPhone').value;
            const sitcName = document.getElementById('editSitcName').value;
            const sitcPhone = document.getElementById('editSitcPhone').value;

            try {
                const { error } = await client
                    .from('school_charges')
                    .update({
                        name_of_hm: hmName,
                        number_of_hm: hmPhone || null,
                        name_of_sitc_psitc: sitcName,
                        number_of_sitc_psitc: sitcPhone || null
                    })
                    .eq('school_code', schoolCode);

                if (error) throw error;

                showToast('Details updated successfully!');
                closeEditModal();
                fetchSchools(); // Refresh the list
            } catch (err) {
                console.error('Error updating school:', err);
                showToast('Failed to update details.', 'error');
            }
        });
    }

    async function fetchSchools() {
        if (!schoolCardContainer) return;

        schoolCardContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading all schools...</p>';

        try {
            const { data, error } = await client
                .from('school_charges')
                .select('school_code, school_name, school_type, category, sub_district, name_of_hm, number_of_hm, name_of_sitc_psitc, number_of_sitc_psitc')
                .order('school_name', { ascending: true });

            if (error) throw error;

            allSchools = data || [];
            renderDistrictTiles(); // Show tiles first
        } catch (err) {
            console.error('Error fetching schools:', err);
            schoolCardContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color:red;">Error loading schools.</p>';
        }
    }

    function filterAndRenderSchools(term) {
        if (!schoolCardContainer) return;

        noResults.style.display = 'none';

        const filtered = allSchools.filter(school => {
            const matchesSearch = (school.school_name || '').toLowerCase().includes(term) ||
                (school.school_code || '').toString().includes(term);
            const matchesDistrict = currentSubDistrictFilter === 'All' || school.sub_district === currentSubDistrictFilter;

            return matchesSearch && matchesDistrict;
        });

        if (filtered.length === 0) {
            schoolCardContainer.innerHTML = '';
            noResults.style.display = 'block';
        } else {
            renderSchools(filtered);
        }
    }

    window.renderSchools = function (schools) {
        if (!schoolCardContainer) return;

        schoolCardContainer.innerHTML = '';

        if (schools.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        schools.forEach(school => {
            const isOwnDistrict = school.sub_district === userSubDistrict;
            const card = document.createElement('div');
            card.className = 'school-card expandable';
            card.onclick = (e) => toggleCard(e, card);

            card.innerHTML = `
                <div class="card-header">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <h4 style="margin: 0;">${school.school_name}</h4>
                            ${isOwnDistrict ? '<span style="font-size: 10px; background: #e6fffa; color: #2c7a7b; padding: 2px 8px; border-radius: 10px; font-weight: 700; text-transform: uppercase;">Your District</span>' : ''}
                        </div>
                        <div class="school-info-item" style="background: none; padding: 0;">
                            <i class="fas fa-map-marker-alt" style="font-size: 12px;"></i>
                            <span style="font-size: 13px; color: #666;">${school.sub_district} | Code: <strong>${school.school_code}</strong></span>
                        </div>
                    </div>
                    <div class="expand-indicator">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>

                <div class="card-details">
                    <div class="school-info-item">
                        <i class="fas fa-user-tie"></i>
                        <span>HM: ${school.name_of_hm || '<span class="text-muted">Not Updated</span>'}</span>
                    </div>
                    <div class="school-info-item">
                        <i class="fas fa-phone-alt"></i>
                        <span>HM Ph: ${school.number_of_hm ? `<a href="tel:${school.number_of_hm}" class="call-link" onclick="event.stopPropagation()" title="Call HM">${school.number_of_hm} <i class="fas fa-phone-volume"></i></a>` : '<span class="text-muted">Not Updated</span>'}</span>
                    </div>
                    <div class="school-info-item">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <span>SITC: ${school.name_of_sitc_psitc || '<span class="text-muted">Not Updated</span>'}</span>
                    </div>
                    <div class="school-info-item">
                        <i class="fas fa-phone-alt"></i>
                        <span>SITC Ph: ${school.number_of_sitc_psitc ? `<a href="tel:${school.number_of_sitc_psitc}" class="call-link" onclick="event.stopPropagation()" title="Call SITC">${school.number_of_sitc_psitc} <i class="fas fa-phone-volume"></i></a>` : '<span class="text-muted">Not Updated</span>'}</span>
                    </div>
                    
                    <div class="badge-container">
                        <div class="school-badge badge-type">${school.school_type || 'General'}</div>
                        <div class="school-badge badge-cat">${school.category || 'Standard'}</div>
                    </div>

                    ${isOwnDistrict ? `
                    <button class="edit-btn" onclick="event.stopPropagation(); openEditModal('${school.school_code}')" style="width: 100%; margin-top: 5px;">
                        <i class="fas fa-edit"></i> Edit Details
                    </button>
                    ` : `
                    <div style="margin-top: 10px; padding: 10px; background: #fffaf0; border-radius: 10px; border: 1px solid #feebc8; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-info-circle" style="color: #dd6b20;"></i>
                        <span style="font-size: 12px; color: #7b341e;">Editing restricted to your district.</span>
                    </div>
                    `}
                </div>
            `;
            schoolCardContainer.appendChild(card);
        });
    };

    window.toggleCard = function (e, cardElement) {
        // Don't toggle if clicking a link or button
        if (e.target.closest('a') || e.target.closest('button')) return;

        const isExpanded = cardElement.classList.contains('expanded');

        // Optional: Close other expanded cards
        document.querySelectorAll('.school-card.expanded').forEach(c => {
            if (c !== cardElement) c.classList.remove('expanded');
        });

        cardElement.classList.toggle('expanded');
    };
});
