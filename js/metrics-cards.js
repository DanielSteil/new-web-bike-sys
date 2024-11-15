document.addEventListener('DOMContentLoaded', function() {
    const metricsGrid = document.getElementById('metrics-grid');
    const servicesWeek = document.querySelector('#services-week p');
    const servicesMonth = document.querySelector('#services-month p');
    const monthlyProfit = document.querySelector('#monthly-profit p');
    const activeCustomers = document.querySelector('#active-customers p');

    async function fetchMetrics() {
        try {
            const response = await fetch('https://api-bike-sys.herokuapp.com/api/v1/services/cards');
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
        monthlyProfit.textContent = `R$ ${data.totalAmountMonth.toFixed(2)}`;
        activeCustomers.textContent = formatDate(data.dateLastService);

        // Update ARIA live regions for accessibility
        servicesWeek.setAttribute('aria-live', 'polite');
        servicesMonth.setAttribute('aria-live', 'polite');
        monthlyProfit.setAttribute('aria-live', 'polite');
        activeCustomers.setAttribute('aria-live', 'polite');
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit'};
        return new Date(dateString).toLocaleString('pt-BR', options);
    }

    fetchMetrics();
});