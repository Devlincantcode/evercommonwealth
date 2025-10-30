console.log("✅ admin-design.js loaded");

// Firestore Reference
const contentRef = db.collection("websiteContent").doc("main");

// ================= LOAD DATA =================
async function loadWebsiteContent() {
    try {
        const doc = await contentRef.get();
        if (!doc.exists) {
            console.error("❌ No website content found in Firestore.");
            return;
        }

        const data = doc.data();
        console.log("✅ Loaded content:", data);

        // Fill text fields
        document.getElementById("title").value = data.title || "";
        document.getElementById("price").value = data.price || "";
        document.getElementById("tagline").value = data.tagline || "";
        document.getElementById("location").value = data.location || "";
        document.getElementById("amenitiesLeft").value = data.amenitiesLeft || "";
        document.getElementById("amenitiesRight").value = data.amenitiesRight || "";
        document.getElementById("accessLeft").value = data.accessLeft || "";
        document.getElementById("accessRight").value = data.accessRight || "";
        document.getElementById("transportation").value = data.transportation || "";
        document.getElementById("footerTitle").value = data.footerTitle || "";
        document.getElementById("footerDescription").value = data.footerDescription || "";
        document.getElementById("facebookUrl").value = data.facebookUrl || "";
        document.getElementById("copyright").value = data.copyright || "";

        // Save in global for image loading
        window.websiteData = data;
        renderCarouselImages();
        renderGalleryImages();
    } catch (error) {
        console.error("❌ Error loading Firestore content:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadWebsiteContent);

// ================= SAVE =================
async function saveAllChanges() {
    const updatedData = {
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        tagline: document.getElementById("tagline").value,
        location: document.getElementById("location").value,
        amenitiesLeft: document.getElementById("amenitiesLeft").value,
        amenitiesRight: document.getElementById("amenitiesRight").value,
        accessLeft: document.getElementById("accessLeft").value,
        accessRight: document.getElementById("accessRight").value,
        transportation: document.getElementById("transportation").value,
        footerTitle: document.getElementById("footerTitle").value,
        footerDescription: document.getElementById("footerDescription").value,
        facebookUrl: document.getElementById("facebookUrl").value,
        copyright: document.getElementById("copyright").value
    };

    try {
        await contentRef.update(updatedData);
        alert("✅ Changes Saved Successfully!");
    } catch (error) {
        console.error("❌ Error Saving:", error);
        alert("❌ Save Failed!");
    }
}
