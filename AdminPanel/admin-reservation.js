// ------------------------------
// Auth
// ------------------------------
function checkStaffAuth() {
    return true; // placeholder
}

function staffLogout() {
    alert("You have been logged out.");
    window.location.href = "admin-login.html";
}

// ------------------------------
// Global
// ------------------------------
let reservations = [];
let reservationToCancel = null;

// ------------------------------
// Load Reservations from Firebase
// ------------------------------
async function loadReservations() {
    try {
        const snapshot = await db.collection("reservations").get();
        reservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("✅ Loaded reservations:", reservations);

        updateStats();
        renderReservationsTable();
    } catch (error) {
        console.error("❌ Error loading reservations:", error);
    }
}

// ------------------------------
// Update Dashboard Stats
// ------------------------------
function updateStats() {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === "confirmed").length;
    const cancelled = reservations.filter(r => r.status === "cancelled").length;

    const revenue = reservations
        .filter(r => r.status === "confirmed")
        .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);

    document.getElementById("totalReservations").textContent = total;
    document.getElementById("confirmedReservations").textContent = confirmed;
    document.getElementById("cancelledReservations").textContent = cancelled;
    document.getElementById("totalRevenue").textContent = `₱${revenue.toFixed(2)}`;
}

// ------------------------------
// Render Table
// ------------------------------
function renderReservationsTable() {
    const container = document.getElementById("reservationsTable");

    if (!reservations.length) {
        container.innerHTML = `
        <div class="empty-state">
            <h3>No Reservations Yet</h3>
            <p>When customers complete bookings, they will appear here.</p>
        </div>`;
        return;
    }

    const dateFilter = document.getElementById("dateFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;

    let filtered = [...reservations];

    // Status filter
    if (statusFilter !== "all") {
        filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Date filter
    const today = new Date();
    filtered = filtered.filter(r => {
        const date = new Date(r.checkIn);
        if (dateFilter === "today") return date.toDateString() === today.toDateString();
        if (dateFilter === "week") return date >= new Date(today.setDate(today.getDate() - 7));
        if (dateFilter === "month") return date >= new Date(today.setMonth(today.getMonth() - 1));
        return true;
    });

    // Latest first
    filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    let html = `
    <table>
        <thead>
            <tr>
                <th>ID</th><th>Name</th><th>Check-in</th><th>Check-out</th>
                <th>Stay Type</th><th>Guests</th><th>Amount</th><th>Status</th><th>Action</th>
            </tr>
        </thead><tbody>`;

    filtered.forEach(r => {
        const guests = r.guests ? `${r.guests.adults} adults, ${r.guests.children} kids` : "N/A";

        html += `
        <tr>
            <td>${r.id}</td>
            <td>${r.name}</td>
            <td>${r.checkIn}</td>
            <td>${r.checkOut}</td>
            <td>${r.stayType}</td>
            <td>${guests}</td>
            <td>₱${r.totalAmount}</td>
            <td><span class="status ${r.status}">${r.status}</span></td>
            <td>${r.status === "confirmed" ?
                `<button class="action-btn cancel" onclick="openCancelModal('${r.id}')">Cancel</button>` :
                `<span class="status cancelled">Cancelled</span>`}
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ------------------------------
// Open / Close Modal
// ------------------------------
function openCancelModal(id) {
    reservationToCancel = id;
    document.getElementById("cancelModal").style.display = "flex";
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// ------------------------------
// Cancel Reservation (Firebase Update)
// ------------------------------
async function cancelReservation() {
    if (!reservationToCancel) return;

    try {
        await db.collection("reservations").doc(reservationToCancel).update({ status: "cancelled" });

        alert("✅ Reservation cancelled.");
        closeModal("cancelModal");
        reservationToCancel = null;

        loadReservations(); // refresh table
    } catch (error) {
        console.error("❌ Cancel error:", error);
    }
}

// ------------------------------
// Setup UI Event Listeners
// ------------------------------
function setupEventListeners() {
    document.getElementById("dateFilter").addEventListener("change", renderReservationsTable);
    document.getElementById("statusFilter").addEventListener("change", renderReservationsTable);
    document.getElementById("confirmCancel").addEventListener("click", cancelReservation);
}

// ------------------------------
// Initialize Page
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
    if (!checkStaffAuth()) return;

    document.getElementById("logoutBtn")?.addEventListener("click", staffLogout);
    setupEventListeners();
    loadReservations();
});
