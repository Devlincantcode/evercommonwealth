// ------------------------------
// Simple auth placeholders (replace with real auth if available)
// ------------------------------
function checkStaffAuth() {
    // Replace with real auth check if you have one
    return true;
}

function staffLogout() {
    alert("You have been logged out (demo).");
    // If you have server-side sessions, call the logout endpoint here
    window.location.href = "admin-login.html";
}
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ admin-reservation.js loaded successfully");

    // Auth
    const staffSession = checkStaffAuth();
    if (!staffSession) return;

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) staffLogout();
        });
    }

    // Navigation (use relative paths)
    const designBtn = document.getElementById("designBtn");
    const reservationBtn = document.getElementById("reservationBtn");

    if (designBtn) {
        designBtn.addEventListener("click", () => {
            window.location.href = "admin-design.html";
        });
    }

    if (reservationBtn) {
        reservationBtn.addEventListener("click", () => {
            window.location.href = "admin-reservation.html";
        });
    }

    // Tabs (if any are present on this page)
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");
    if (tabs.length) {
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                tabContents.forEach(content => {
                    content.classList.remove("active");
                    if (content.id === `${tab.dataset.tab}-tab`) content.classList.add("active");
                });
            });
        });
    }

    // Initialize upload widgets if present
    initializeFileUploads();

    // Fetch content safely (non-blocking)
    try {
        const response = await fetch("get_content.php");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        if (data && data.title) {
            // Populate fields only if they exist on this page
            const setIfExists = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.value = value || "";
            };

            setIfExists("title", data.title);
            setIfExists("price", data.price);
            setIfExists("tagline", data.tagline);
            setIfExists("location", data.location);
            setIfExists("amenitiesLeft", data.amenetiesLeft || data.amenitiesLeft);
            setIfExists("amenitiesRight", data.amenetiesRight || data.amenitiesRight);
            setIfExists("accessLeft", data.accessLeft);
            setIfExists("accessRight", data.accessRight);
            setIfExists("transportation", data.transportation);
            setIfExists("footerTitle", data.footerTitle);
            setIfExists("footerDescription", data.footerDescription);
            setIfExists("facebookUrl", data.facebookUrl);
            setIfExists("copyright", data.copyright);
        } else {
            console.warn("⚠️ No content returned from get_content.php — using local data fallback.");
            loadWebsiteData();
        }
    } catch (err) {
        console.error("❌ Error fetching content:", err);
        loadWebsiteData();
    }

    // Render images if any are present
    renderCarouselImages();
    renderGalleryImages();

    // Reservation page specific init (if reservation elements exist)
    initReservationUI();
});

// ------------------------------
// File upload helpers (same as design page)
// ------------------------------
function initializeFileUploads() {
    const carouselUploadArea = document.getElementById('carouselUploadArea');
    const carouselFileInput = document.getElementById('carouselFileInput');
    if (carouselUploadArea && carouselFileInput) setupFileUpload(carouselUploadArea, carouselFileInput, 'carousel');

    const galleryUploadArea = document.getElementById('galleryUploadArea');
    const galleryFileInput = document.getElementById('galleryFileInput');
    if (galleryUploadArea && galleryFileInput) setupFileUpload(galleryUploadArea, galleryFileInput, 'gallery');
}

function setupFileUpload(uploadArea, fileInput, type) {
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files, type));

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFileUpload(e.dataTransfer.files, type);
    });
}

function handleFileUpload(files, type) {
    if (!files || files.length === 0) return;
    const progressBar = document.getElementById(`${type}ProgressFill`);
    const progressText = document.getElementById(`${type}ProgressText`);
    const progressContainer = document.getElementById(`${type}Progress`);
    if (progressContainer) progressContainer.style.display = 'block';

    Array.from(files).forEach((file, idx) => {
        if (!file.type.startsWith('image/')) {
            alert(`"${file.name}" is not an image.`);
            return;
        }
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `Uploading ${file.name}... ${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                const reader = new FileReader();
                reader.onload = (e) => {
                    websiteData[type].push({ url: e.target.result, alt: file.name.split('.')[0], filename: file.name });
                    if (type === 'carousel') renderCarouselImages(); else renderGalleryImages();
                    if (idx === files.length - 1) {
                        if (progressContainer) progressContainer.style.display = 'none';
                        if (progressBar) progressBar.style.width = '0%';
                        saveToLocalStorage();
                    }
                };
                reader.readAsDataURL(file);
            }
        }, 100);
    });
}

// ------------------------------
// Image render / edit functions (same as design page)
// ------------------------------
function renderCarouselImages() {
    const container = document.getElementById('carouselImages');
    if (!container) return;
    container.innerHTML = '';
    if (!websiteData.carousel || websiteData.carousel.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No carousel images uploaded yet.</p></div>';
        return;
    }
    websiteData.carousel.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${image.url}" alt="${image.alt}">
            <div class="image-actions">
                <button class="btn btn-secondary btn-sm" onclick="editImage('carousel', ${index})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-danger btn-sm" onclick="removeImage('carousel', ${index})"><i class="bi bi-trash"></i></button>
            </div>`;
        container.appendChild(imageItem);
    });
}

function renderGalleryImages() {
    const container = document.getElementById('galleryImages');
    if (!container) return;
    container.innerHTML = '';
    if (!websiteData.gallery || websiteData.gallery.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No gallery images uploaded yet.</p></div>';
        return;
    }
    websiteData.gallery.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${image.url}" alt="${image.alt}">
            <div class="image-actions">
                <button class="btn btn-secondary btn-sm" onclick="editImage('gallery', ${index})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-danger btn-sm" onclick="removeImage('gallery', ${index})"><i class="bi bi-trash"></i></button>
            </div>`;
        container.appendChild(imageItem);
    });
}

function editImage(section, index) {
    const image = websiteData[section][index];
    if (!image) return;
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    document.getElementById('modalTitle').textContent = `Edit ${section} Image`;
    document.getElementById('imageAlt').value = image.alt || '';
    document.getElementById('previewImg').src = image.url || '';
    document.getElementById('imagePreview').style.display = 'block';
    modal.style.display = 'flex';
    document.getElementById('saveImageBtn').onclick = function() {
        const alt = document.getElementById('imageAlt').value;
        if (!alt) return alert('Please enter alt text.');
        websiteData[section][index].alt = alt;
        if (section === 'carousel') renderCarouselImages(); else renderGalleryImages();
        saveToLocalStorage();
        closeModal('imageModal');
    };
}

function removeImage(section, index) {
    if (!websiteData[section]) return;
    if (!confirm('Are you sure you want to remove this image?')) return;
    websiteData[section].splice(index, 1);
    if (section === 'carousel') renderCarouselImages(); else renderGalleryImages();
    saveToLocalStorage();
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// ------------------------------
// Local storage / form helpers
// ------------------------------
function loadWebsiteData() {
    const stored = localStorage.getItem('everpeakWebsiteData');
    if (stored) {
        websiteData = { ...websiteData, ...JSON.parse(stored) };
        populateFormFields();
    }
}

function populateFormFields() {
    const setIf = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setIf('title', websiteData.content.title);
    setIf('price', websiteData.content.price);
    setIf('tagline', websiteData.content.tagline);
    setIf('location', websiteData.content.location);
    setIf('amenitiesLeft', websiteData.content.amenitiesLeft);
    setIf('amenitiesRight', websiteData.content.amenitiesRight);
    setIf('accessLeft', websiteData.content.accessLeft);
    setIf('accessRight', websiteData.content.accessRight);
    setIf('transportation', websiteData.content.transportation);
    setIf('footerTitle', websiteData.footer.title);
    setIf('footerDescription', websiteData.footer.description);
    setIf('facebookUrl', websiteData.footer.facebookUrl);
    setIf('copyright', websiteData.footer.copyright);
}

function saveToLocalStorage() {
    localStorage.setItem('everpeakWebsiteData', JSON.stringify(websiteData));
}

// ------------------------------
// Reservation page specific UI (if used)
// ------------------------------
function initReservationUI() {
    // Placeholder: add reservation-specific initializations here if needed
    // e.g. load reservation list from API, attach filters, etc.
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            // Implement filtering logic or fetch reservations for date range
            console.log('Date filter changed:', dateFilter.value);
        });
    }
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            console.log('Status filter changed:', statusFilter.value);
        });
    }
}

// ------------------------------
// Save content to DB (shared)
// ------------------------------
async function saveAllChanges() {
    const gather = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };

    const data = {
        title: gather("title"),
        price: gather("price"),
        tagline: gather("tagline"),
        location: gather("location"),
        footerTitle: gather("footerTitle"),
        footerDescription: gather("footerDescription"),
        facebookUrl: gather("facebookUrl"),
        copyright: gather("copyright"),
        amenetiesLeft: gather("amenitiesLeft"),
        amenetiesRight: gather("amenitiesRight"),
        accessLeft: gather("accessLeft"),
        accessRight: gather("accessRight"),
        transportation: gather("transportation")
    };

    try {
        const response = await fetch("save_content.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) alert("✅ Content updated successfully!");
        else alert("❌ Failed to update: " + (result.error || "Unknown error"));
    } catch (err) {
        console.error("❌ Error saving content:", err);
        alert("Error connecting to server. Please try again.");
    }
}
