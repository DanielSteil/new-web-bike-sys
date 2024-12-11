document.addEventListener('DOMContentLoaded', function() {
    const servicesTableBody = document.getElementById('services-table-body');
    const clientNameInput = document.getElementById('client-name');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const applyFiltersButton = document.getElementById('apply-filters');
    const filterButton = document.getElementById('filter-button');
    const filterDropdown = document.getElementById('filter-dropdown');
    const modal = document.getElementById('service-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.getElementById('close-modal');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');
    const createServiceButton = document.getElementById('create-service');
    const newServiceModal = document.getElementById('new-service-modal');
    const newServiceForm = document.getElementById('new-service-form');
    const cancelNewServiceButton = document.getElementById('cancel-new-service');
    const clientSearchInput = document.getElementById('client-search');
    const clientResultsList = document.getElementById('client-results');
    const bikeSelect = document.getElementById('bike-select');
    
    const newClientModal = document.getElementById('new-client-modal');
    // create-new-client
    const newClientForm = document.getElementById('new-client-form'); 
    const cancelNewClientButton = document.getElementById('cancel-new-client');
    const createNewClientButton = document.getElementById('create-new-client');

    const serverUrl = "https://api-bike-sys.herokuapp.com";
    // const serverUrl = "http://localhost:9004";

    let currentPage = 0;
    const pageSize = 10; // Number of items per page
    let selectedClientId = null;
    let clientSelect = null;

    createNewClientButton.addEventListener('click', () => {
        newClientModal.classList.remove('hidden');
    });

    cancelNewClientButton.addEventListener('click', () => {
        newClientModal.classList.add('hidden');
        resetNewClientForm();
    });

    newClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createNewClient();
    });

    async function createNewClient() {
        const clientName = document.getElementById('client-name-modal').value;
        const clientNumber = document.getElementById('client-number-modal').value;
        const clientBikeModel = document.getElementById('client-bike-modal').value;

        if (!clientName || !clientNumber) {
            alert('Please fill in all fields');
            return;
        }

        const newClient = {
            name: clientName,
            number: clientNumber,
            bikeModel: clientBikeModel
        };

        try {
            const response = await fetch(`${serverUrl}/api/v1/clients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClient),
            });

            if (!response.ok) {
                throw new Error('Failed to create new client');
            }

            const responseCreatedClient = await response.json();
            console.log('New client created:', responseCreatedClient);
            const createdClient = responseCreatedClient.record;
            newClientModal.classList.add('hidden');
            resetNewClientForm();

            clientSearchInput.value = createdClient.name;
            await searchClients();

            selectClient(createdClient);
        } catch (error) {
            console.error('Error creating new client:', error);
            alert('Failed to create new client. Please try again.');
        }
    }

    function resetNewClientForm() {
        newClientForm.reset();
    }

    // Toggle filter dropdown
    filterButton.addEventListener('click', () => {
        filterDropdown.classList.toggle('hidden');
    });

    // Close filter dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!filterButton.contains(event.target) && !filterDropdown.contains(event.target)) {
            filterDropdown.classList.add('hidden');
        }
    });

    createServiceButton.addEventListener('click', () => {
        document.getElementById("service-date").valueAsDate = new Date();
        newServiceModal.classList.remove('hidden');
    });

    cancelNewServiceButton.addEventListener('click', () => {
        newServiceModal.classList.add('hidden');
        newClientModal.classList.add('hidden');
        resetNewServiceForm();
    });

    clientSearchInput.addEventListener('input', debounce(searchClients, 300));

    newServiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createNewService();
    });

    async function searchClients() {
        const searchTerm = clientSearchInput.value.trim();
        if (searchTerm.length < 2) {
            clientResultsList.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`${serverUrl}/api/v1/clients?name=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch clients');
            }
            const clients = await response.json();
            displayClientResults(clients);
        } catch (error) {
            console.error('Error searching clients:', error);
            clientResultsList.innerHTML = '<li class="p-2 text-red-500">Erro consultando clientes.</li>';
        }
    }

    function displayClientResults(clients) {
        clientResultsList.innerHTML = '';
        clients.records.forEach(client => {
            const li = document.createElement('li');
            li.className = 'p-2 hover:bg-gray-100 cursor-pointer';
            li.textContent = `${client.name} (${client.number})`;
            li.addEventListener('click', () => selectClient(client));
            clientResultsList.appendChild(li);
        });
    }

    async function selectClient(client) {
        console.log(client)
        selectedClientId = client.id;
        clientSearchInput.value = client.name;
        clientSelect = client;
        clientResultsList.innerHTML = '';
        bikeSelect.disabled = false;

        try {
            const bikes = client.bikes;
            displayClientBikes(bikes);
        } catch (error) {
            console.error('Error fetching client bikes:', error);
            bikeSelect.innerHTML = '<option value="">Erro consultando bicicletas</option>';
        }
    }

    function displayClientBikes(bikes) {
        if(bikes.length === 1) {
            console.log("No If");
            const bike = bikes[0];
            bikeSelect.innerHTML = `<option value="${bike.id}">${bike.model}</option>`;
        }
        else {
            console.log("No else");
            bikeSelect.innerHTML = '<option value="">Escolha a bike</option>';
            bikes.forEach(bike => {
                const option = document.createElement('option');
                option.value = bike.id;
                option.textContent = bike.model;
                bikeSelect.appendChild(option);
            });
        }
    }

    async function createNewService() {
        const description = document.getElementById('description').value;
        const value = document.getElementById('value').value;
        const bikeId = bikeSelect.value;
        const clientId = clientSelect;
        const serviceDate = document.getElementById('service-date').value;

        console.log(bikeSelect);
        if (!description || !value || !selectedClientId || !bikeId || !serviceDate) {
            alert('Preencha todos os campos!');
            return;
        }

        const newService = {
            description,
            value: parseFloat(value),
            bike: JSON.parse("{\"id\":"+bikeId+"}"),
            serviceDate
        };

        console.log(newService)

        try {
            const response = await fetch(`${serverUrl}/api/v1/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newService),
            });

            if (!response.ok) {
                throw new Error('Failed to create new service');
            }

            const createdService = await response.json();
            console.log('New service created:', createdService);
            newServiceModal.classList.add('hidden');
            resetNewServiceForm();
            fetchServices(); // Refresh the services list
        } catch (error) {
            console.error('Error creating new service:', error);
            alert('Erro ao criar serviço.');
        }
    }

    function resetNewServiceForm() {
        newServiceForm.reset();
        selectedClientId = null;
        bikeSelect.disabled = true;
        bikeSelect.innerHTML = '<option value="">Escolha a bicicleta</option>';
        clientResultsList.innerHTML = '';
    }

    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    async function fetchServices() {
        try {
            servicesTableBody.innerHTML = '<tr><td colspan="7" class="py-4 px-6 text-center">Carregando...</td></tr>';
            const clientName = clientNameInput.value;
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;

            const queryParams = new URLSearchParams({
                clientName,
                startDate,
                endDate,
                pageIndex: currentPage,
                pageSize: pageSize
            });

            const response = await fetch(`${serverUrl}/api/v1/services?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }
            const data = await response.json();
            renderServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
            servicesTableBody.innerHTML = '<tr><td colspan="7" class="py-4 px-6 text-center">Erro ao carregar serviços.</td></tr>';
        }
    }

    function renderServices(data) {
        servicesTableBody.innerHTML = '';
        data.records.forEach(service => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-100';
            row.innerHTML = `
                <td class="py-3 px-4">${formatDate(service.serviceDate)}</td>
                <td class="py-3 px-4">${escapeHtml(service.bike.client.name)}</td>
                <td class="py-3 px-4">${escapeHtml(service.bike.model)}</td>
                <td class="py-3 px-4">${escapeHtml(service.description)}</td>
                <td class="py-3 px-4">
                    <button class="view-details p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="View service details" data-service-id="${service.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                    </button>
                </td>
            `;
            servicesTableBody.appendChild(row);
        });

        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const serviceId = this.getAttribute('data-service-id');
                openModal(serviceId);
            });
        });

        // Update pagination
        updatePagination(data);
    }

    function updatePagination(data) {
        const pageInfo = data.pageInfo;
        currentPageSpan.textContent = pageInfo.pageIndex + 1;
        prevPageButton.disabled = !pageInfo.hasPrevious;
        nextPageButton.disabled = pageInfo.hasNext;
    }

    applyFiltersButton.addEventListener('click', () => {
        currentPage = 0;
        fetchServices();
        filterDropdown.classList.add('hidden');
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            fetchServices();
        }
    });

    nextPageButton.addEventListener('click', () => {
        currentPage++;
        fetchServices();
    });

    async function openModal(serviceId) {
        try {
            const response = await fetch(`${serverUrl}/api/v1/services/${serviceId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch service details');
            }
            const serviceDetails = await response.json();
            displayServiceDetails(serviceDetails);
        } catch (error) {
            console.error('Error fetching service details:', error);
            modalContent.innerHTML = '<p>Erro ao carregar informações do serviço.</p>';
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
        const day = ("0" + (data.getDate() + 1)).slice(-2)
        const options = { year: 'numeric', month: '2-digit', day: '2-digit'};
        // return new Date(dateString).toLocaleString(options, {timeZone: 'UTC'});
        return `${day}-${month}-${year}`;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    fetchServices();
});