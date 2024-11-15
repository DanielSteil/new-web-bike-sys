document.addEventListener('DOMContentLoaded', function() {
    const recentOrdersTable = document.querySelector('.recent-orders table tbody');
    const recentOrdersSection = document.querySelector('.recent-orders');

    async function fetchRecentOrders() {
        try {
            recentOrdersSection.setAttribute('aria-busy', 'true');
            const response = await fetch('https://api-bike-sys.herokuapp.com/api/v1/services/lasts?limit=7'); // Replace with your actual API endpoint
            if (!response.ok) {
                throw new Error('Failed to fetch recent orders');
            }
            const orders = await response.json();
            populateRecentOrders(orders);
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            recentOrdersTable.innerHTML = '<tr><td colspan="6">Erro ao consultar ultimos serviços.</td></tr>';
        } finally {
            recentOrdersSection.removeAttribute('aria-busy');
        }
    }

    function populateRecentOrders(orders) {
        recentOrdersTable.innerHTML = ''; // Clear existing rows
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${escapeHtml(order.clientName)}</td>
                <td>${escapeHtml(order.clientBike)}</td>
                <td>${formatDate(order.serviceDate)}</td>
                <td>R$ ${order.totalAmount.toFixed(2)}</td>
                <td>
                    <button class="expand-button" aria-label="Expand order details">
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
                // Implement expand functionality here
                console.log('Expand button clicked');
            });
        });
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString('pt-BR', options);
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