document.addEventListener('DOMContentLoaded', function() {
    const metricsGrid = document.getElementById('metrics-grid');
    const servicesWeek = document.querySelector('#services-week p');
    const servicesMonth = document.querySelector('#services-month p');
    const monthlyProfit = document.querySelector('#monthly-profit p');
    const activeCustomers = document.querySelector('#active-customers p');

    const serverUrl = "https://api-bike-sys.herokuapp.com";
    // const serverUrl = "http://localhost:9004";

    async function fetchMetrics() {
        try {
            const response = await fetch(`${serverUrl}/api/v1/services/cards`);
            if (!response.ok) {
                throw new Error('Failed to fetch metrics');
            }
            const data = await response.json();
            updateMetrics(data);
        } catch (error) {
            console.error('Error fetching metrics:', error);
            metricsGrid.innerHTML = '<p>Erro ao carregar informações dos cards.</p>';
        }
    }

    function updateMetrics(data) {
        servicesWeek.textContent = data.servicesWeek;
        servicesMonth.textContent = data.servicesMonth;
        monthlyProfit.textContent = data.totalAmountMonth != null ? `R$ ${data.totalAmountMonth.toFixed(2)}` : "R$ 0";
        activeCustomers.textContent = data.dateLastService != null ? formatDate(data.dateLastService) : "----";

        // Update ARIA live regions for accessibility
        servicesWeek.setAttribute('aria-live', 'polite');
        servicesMonth.setAttribute('aria-live', 'polite');
        monthlyProfit.setAttribute('aria-live', 'polite');
        activeCustomers.setAttribute('aria-live', 'polite');
    }

    function formatDate(dateString) {
        const data = new Date(dateString);
        const year = data.getFullYear();
        const month = data.getMonth()+1;
        const day = ("0" + data.getDate()).slice(-2)
        return `${day}/${month}/${year}`;
    }

    fetchMetrics();
});