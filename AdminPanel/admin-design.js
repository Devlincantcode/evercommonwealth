// ------------------------------
// Auth placeholder (replace later with Firebase Auth)
// ------------------------------
function checkStaffAuth() {
    return true; // Allow access for now
}

function staffLogout() {
    alert("You have been logged out.");
    window.location.href = "admin-login.html";
}

// ------------------------------
// Default website data structure
// ------------------------------
let websiteData = {
    carousel: [],
    gallery: [],
    content: {
        title: "",
        price: "",
        tagline: "",
        location: "",
        amenitiesLeft: "",
        amenitiesRight: "",
        accessLeft: "",
        accessRight: "",
        transportation: ""
    },
    footer: {
        title: "",
        description: "",
        facebookUrl: "",
        copyright: ""
    }
};

// ------------------------------
// Load Content from Firestore
// ------------------------------
async function loadFromFirestore() {
    try {
        const docRef = db.collection("websiteContent").doc("main");
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            websiteData = docSnap.data();
            console.log("✅ Loaded content from Firestore:", websiteData);
        } else {
            console.warn("⚠️ No Firestore data yet — using local cache if available");
            loadFromLocalStorage();
        }

        populateFormFields();
        renderCarouselImages();
        renderGalleryImages();
    } catch (error) {
        console.error("❌ Firestore load failed:", error);
        loadFromLocalStorage();
    }
}

// ------------------------------
// Save Content to Firestore
// ------------------------------
async function saveAllChanges() {
    const gather = (id) => document.getElementById(id)?.value || "";

    websiteData.content = {
        title: gather("title"),
        price: gather("price"),
        tagline: gather("tagline"),
        location: gather("location"),
        amenitiesLeft: gather("amenitiesLeft"),
        amenitiesRight: gather("amenitiesRight"),
        accessLeft: gather("accessLeft"),
        accessRight: gather("accessRight"),
        transportation: gather("transportation")
    };

    websiteData.footer = {
        title: gather("footerTitle"),
        description: gather("footerDescription"),
        facebookUrl: gather("facebookUrl"),
        copyright: gather("copyright")
    };

    try {
        await db.collection("websiteContent").doc("main").set(websiteData);
        alert("✅ Saved to Firebase successfully!");
        saveToLocalStorage();
    } catch (err) {
        console.error("❌ Error saving to Firestore:", err);
        alert("Failed to save. Check console.");
    }
}

// ------------------------------
// Local Backup System
// ------------------------------
function loadFromLocalStorage() {
    const saved = localStorage.getItem("everpeakWebsiteData");
    if (saved) {
        websiteData = JSON.parse(saved);
        console.log("📦 Loaded from localStorage");
    }
}

function saveToLocalStorage() {
    localStorage.setItem("everpeakWebsiteData", JSON.stringify(websiteData));
}

// ------------------------------
// Populate Form Fields
// ------------------------------
function populateFormFields() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };

    set("title", websiteData.content.title);
    set("price", websiteData.content.price);
    set("tagline", websiteData.content.tagline);
    set("location", websiteData.content.location);
    set("amenitiesLeft", websiteData.content.amenitiesLeft);
    set("amenitiesRight", websiteData.content.amenitiesRight);
    set("accessLeft", websiteData.content.accessLeft);
    set("accessRight", websiteData.content.accessRight);
    set("transportation", websiteData.content.transportation);

    set("footerTitle", websiteData.footer.title);
    set("footerDescription", websiteData.footer.description);
    set("facebookUrl", websiteData.footer.facebookUrl);
    set("copyright", websiteData.footer.copyright);
}

// ------------------------------
// Image Upload / Preview / Remove
// ------------------------------
function renderCarouselImages() {
    const container = document.getElementById("carouselImages");
    if (!container) return;

    container.innerHTML = websiteData.carousel.length
        ? ""
        : `<div class="empty-state"><p>No carousel images uploaded yet.</p></div>`;

    websiteData.carousel.forEach((image, i) => {
        container.innerHTML += `
        <div class="image-item">
            <img src="${image.url}" alt="${image.alt}">
            <div class="image-actions">
                <button onclick="editImage('carousel', ${i})" class="btn btn-secondary btn-sm"><i class="bi bi-pencil"></i></button>
                <button onclick="removeImage('carousel', ${i})" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></button>
            </div>
        </div>`;
    });
}

function renderGalleryImages() {
    const container = document.getElementById("galleryImages");
    if (!container) return;

    container.innerHTML = websiteData.gallery.length
        ? ""
        : `<div class="empty-state"><p>No gallery images uploaded yet.</p></div>`;

    websiteData.gallery.forEach((image, i) => {
        container.innerHTML += `
        <div class="image-item">
            <img src="${image.url}" alt="${image.alt}">
            <div class="image-actions">
                <button onclick="editImage('gallery', ${i})" class="btn btn-secondary btn-sm"><i class="bi bi-pencil"></i></button>
                <button onclick="removeImage('gallery', ${i})" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></button>
            </div>
        </div>`;
    });
}

function editImage(section, index) {
    const modal = document.getElementById("imageModal");
    document.getElementById("modalTitle").textContent = `Edit ${section} Image`;
    document.getElementById("imageAlt").value = websiteData[section][index].alt || "";
    document.getElementById("previewImg").src = websiteData[section][index].url;
    modal.style.display = "flex";

    document.getElementById("saveImageBtn").onclick = () => {
        websiteData[section][index].alt = document.getElementById("imageAlt").value;
        saveToLocalStorage();
        renderCarouselImages();
        renderGalleryImages();
        modal.style.display = "none";
    };
}

function removeImage(section, index) {
    if (!confirm("Remove this image?")) return;
    websiteData[section].splice(index, 1);
    saveToLocalStorage();
    renderCarouselImages();
    renderGalleryImages();
}

// ------------------------------
// Init Page
// ------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ Admin Panel JS Loaded");
    if (!checkStaffAuth()) return;

    await loadFromFirestore();

    // Navigation
    document.getElementById("designBtn")?.addEventListener("click", () => location.href = "admin-design.html");
    document.getElementById("reservationBtn")?.addEventListener("click", () => location.href = "admin-reservation.html");
    document.getElementById("logoutBtn")?.addEventListener("click", staffLogout);
});
