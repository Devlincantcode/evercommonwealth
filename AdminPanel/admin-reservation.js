let reservations = [];
let reservationToCancel = null;

document.addEventListener("DOMContentLoaded", () => {
    loadReservations();
    setupEventListeners();
});

/**
 * Load reservations from localStorage
 */
function loadReservations() {
    const storedReservations = localStorage.getItem('reservations');
    reservations = storedReservations ? JSON.parse(storedReservations) : [];

    updateStats();
    renderReservationsTable();
}

/**
 * Update Dashboard Statistics
 */
function updateStats() {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;
    
    const revenue = reservations
        .filter(r => r.status === 'confirmed')
        .reduce((sum, r) => {
            const amount = parseFloat(r.totalAmount.replace('P', '').replace(',', ''));
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

    document.getElementById('totalReservations').textContent = total;
    document.getElementById('confirmedReservations').textContent = confirmed;
    document.getElementById('cancelledReservations').textContent = cancelled;
    document.getElementById('totalRevenue').textContent = `P${revenue.toFixed(2)}`;
}

/**
 * Render Reservations Table
 */
function renderReservationsTable() {
    const container = document.getElementById('reservationsTable');

    if (reservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Reservations Yet</h3>
                <p>When customers complete bookings, they will appear here.</p>
            </div>
        `;
        return;
    }

    const dateFilter = document.getElementById('dateFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    let filtered = [...reservations];

    if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (dateFilter !== 'all') {
        const today = new Date();

        filtered = filtered.filter(r => {
            const checkInDate = new Date(r.checkIn);

            if (dateFilter === 'today') {
                return checkInDate.toDateString() === today.toDateString();
            } 
            if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                return checkInDate >= weekAgo;
            } 
            if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                return checkInDate >= monthAgo;
            }
            return true;
        });
    }

    filtered.sort((a, b) => b.id - a.id);

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Stay Type</th>
                    <th>Guests</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtered.forEach(res => {
        const guests = res.guests ? `${res.guests.adults} adult(s), ${res.guests.children} child(ren)` : "1 adult, 0 children";

        tableHTML += `
            <tr>
                <td>${res.id}</td>
                <td>${res.name}</td>
                <td>${res.checkIn}</td>
                <td>${res.checkOut}</td>
                <td>${res.stayType}</td>
                <td>${guests}</td>
                <td>${res.totalAmount}</td>
                <td><span class="status ${res.status}">${res.status}</span></td>
                <td>
                    ${res.status === 'confirmed' 
                        ? `<button class="action-btn cancel" onclick="openCancelModal(${res.id})">Cancel</button>` 
                        : '<span class="status cancelled">Cancelled</span>'}
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    container.innerHTML = tableHTML;
}

/**
 * Cancel Reservation Modal
 */
function openCancelModal(id) {
    reservationToCancel = id;
    document.getElementById('cancelModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('cancelModal').style.display = 'none';
}

/**
 * Cancel Reservation
 */
function cancelReservation() {
    const index = reservations.findIndex(r => r.id === reservationToCancel);
    if (index === -1) return;

    reservations[index].status = 'cancelled';

    localStorage.setItem("reservations", JSON.stringify(reservations));

    updateStats();
    renderReservationsTable();
    closeModal();
}

/**
 * UI Event Listeners
 */
function setupEventListeners() {
    document.getElementById('dateFilter').addEventListener('change', renderReservationsTable);
    document.getElementById('statusFilter').addEventListener('change', renderReservationsTable);
    document.getElementById('confirmCancel').addEventListener('click', cancelReservation);
}
