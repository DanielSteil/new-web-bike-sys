document.addEventListener('DOMContentLoaded', function() {
    const recentOrdersTable = document.querySelector('.recent-orders table tbody');
    const recentOrdersSection = document.querySelector('.recent-orders');
    const modal = document.getElementById('service-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.getElementById('close-modal');

    // const serverUrl = "https://api-bike-sys.herokuapp.com";
    const serverUrl = "http://localhost:9004";

    async function fetchRecentOrders() {
        try {
            recentOrdersSection.setAttribute('aria-busy', 'true');
            const response = await fetch(`${serverUrl}/api/v1/services/lasts?limit=7`); 
            if (!response.ok) {
                throw new Error('Failed to fetch recent orders');
            }
            const orders = await response.json();
            populateRecentOrders(orders);
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            recentOrdersTable.innerHTML = '<tr><td colspan="6">Failed to load recent orders. Please try again later.</td></tr>';
        } finally {
            recentOrdersSection.removeAttribute('aria-busy');
        }
    }

    function populateRecentOrders(orders) {
        recentOrdersTable.innerHTML = ''; // Clear existing rows
        orders.records.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${escapeHtml(order.bike.client.name)}</td>
                <td>${escapeHtml(order.bike.model)}</td>
                <td>${formatDate(order.serviceDate)}</td>
                <td>R$ ${order.value.toFixed(2)}</td>
                <td>
                    <button class="expand-button p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Expand order details" data-order-id="${order.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-arrows-angle-expand" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"/>
                        </svg>
                    </button>
                </td>
            `;
            recentOrdersTable.appendChild(row);
        });

        // Add event listeners to expand buttons
        document.querySelectorAll('.expand-button').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                openModal(orderId);
            });
        });
    }

    async function openModal(orderId) {
        try {
            const response = await fetch(`${serverUrl}/api/v1/services/${orderId}`); 
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            const serviceDetails = await response.json();
            displayServiceDetails(serviceDetails);
        } catch (error) {
            console.error('Error fetching order details:', error);
            modalContent.innerHTML = '<p>Failed to load order details. Please try again later.</p>';
        }
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    function displayServiceDetails(serviceDetails) {
        modalContent.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h3 class="font-bold">Cliente</h3>
                    <p>Nome: ${escapeHtml(serviceDetails.record.bike.client.name)}</p>
                    <p>Número: ${escapeHtml(serviceDetails.record.bike.client.number)}</p>
                </div>
                <div>
                    <h3 class="font-bold">Bicicleta</h3>
                    <p>Modelo: ${escapeHtml(serviceDetails.record.bike.model)}</p>
                </div>
            </div>
            <div class="mt-4">
                <h3 class="font-bold">Serviço</h3>
                <p>Descrição: ${escapeHtml(serviceDetails.record.description)}</p>
                <p>Data: ${formatDate(serviceDetails.record.serviceDate)}</p>
            </div>
            <div class="mt-4">
                <h3 class="font-bold">Total: R$ ${serviceDetails.record.value.toFixed(2)}</h3>
            </div>
        `;
    }


    function closeModalHandler() {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Re-enable scrolling
    }

    closeModal.addEventListener('click', closeModalHandler);

    // Close modal when clicking outside of it
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModalHandler();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModalHandler();
        }
    });

    function formatDate(dateString) {
        const data = new Date(dateString);
        const year = data.getFullYear();
        const month = data.getMonth()+1;
        const day = ("0" + data.getDate()).slice(-2)
        return `${day}/${month}/${year}`;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    fetchRecentOrders();
});