document.addEventListener('DOMContentLoaded', function() {
    const clientsTableBody = document.getElementById('clients-table-body');
    const clientNameFilter = document.getElementById('client-name-filter');
    const newClientBtn = document.getElementById('new-client-btn');
    const clientModal = document.getElementById('client-modal');
    const clientForm = document.getElementById('client-form');
    const cancelClientBtn = document.getElementById('cancel-client');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const clientModalTitle = document.getElementById('client-modal-title');
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const addBikeBtn = document.getElementById('add-bike-btn');
    const bikesContainer = document.getElementById('bikes-container');

    // const serverUrl = "https://api-bike-sys.herokuapp.com";
    const serverUrl = "http://localhost:9004";

    let currentPage = 0;
    let totalPages = 1;
    let itemToDelete = null;

    function fetchClients() {
        clientsTableBody.innerHTML = '<tr><td colspan="7" class="py-4 px-6 text-center">Carregando...</td></tr>';
        const filter = clientNameFilter.value;
        fetch(`${serverUrl}/api/v1/clients?pageIndex=${currentPage}&name=${filter}`)
            .then(response => response.json())
            .then(data => {
                renderClients(data.records);
                totalPages = data.pageInfo.totalPages;
                updatePagination();
            })
            .catch(error => {
                console.error('Error fetching clients:', error);
                clientsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-red-500">Failed to load clients. Please try again later.</td></tr>';
            });
    }

    function renderClients(clients) {
        clientsTableBody.innerHTML = '';
        clients.forEach(client => {
            const row = document.createElement('tr');
            const bikesNames = client.bikes.map(bike => bike.model).join(" | ");
            row.className = 'client-row';
            row.innerHTML = `
                <td>${escapeHtml(client.name)}</td>
                <td>${escapeHtml(client.number)}</td>
                <td>${escapeHtml(bikesNames)}</td>
                <td class="text-right">
                    <button class="action-button edit-button" data-id="${client.id}">Editar</button>
                    <button class="action-button remove-button" data-id="${client.id}">Remover</button>
                </td>
            `;
            clientsTableBody.appendChild(row);
        });
    }

    function updatePagination() {
        // pageInfo.textContent = `Página ${currentPage+1} de ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    function editClient(id) {
        fetch(`/api/clients/${id}`)
            .then(response => response.json())
            .then(client => {
                document.getElementById('client-id').value = client.id;
                document.getElementById('name').value = client.name;
                document.getElementById('number').value = client.number;
                renderBikeInputs(client.bikes);
                clientModalTitle.textContent = 'Edit Client';
                clientModal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching client:', error);
                alert('Failed to load client. Please try again.');
            });
    }

    function deleteClient(id) {
        itemToDelete = id;
        deleteConfirmationModal.style.display = 'block';
    }

    function renderBikeInputs(bikes) {
        bikesContainer.innerHTML = '';
        bikes.forEach((bike, index) => {
            addBikeInput(bike);
        });
    }

    function addBikeInput(value = '') {
        const bikeInput = document.createElement('div');
        bikeInput.className = 'bike-input';
        bikeInput.innerHTML = `
            <input type="text" name="bikes[]" value="${escapeHtml(value)}" placeholder="Enter bike details">
            <button type="button" class="remove-bike-btn">
                <i data-lucide="x"></i>
            </button>
        `;
        bikesContainer.appendChild(bikeInput);

        bikeInput.querySelector('.remove-bike-btn').addEventListener('click', function() {
            bikesContainer.removeChild(bikeInput);
        });

        lucide.createIcons();
    }

    clientNameFilter.addEventListener('input', debounce(() => {
        currentPage = 0;
        fetchClients();
    }, 300));

    newClientBtn.addEventListener('click', () => {
        clientForm.reset();
        document.getElementById('client-id').value = '';
        renderBikeInputs([]);
        clientModalTitle.textContent = 'Add New Client';
        clientModal.style.display = 'block';
    });

    cancelClientBtn.addEventListener('click', () => {
        clientModal.style.display = 'none';
    });

    addBikeBtn.addEventListener('click', () => {
        addBikeInput();
    });

    clientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const clientData = {
            id: formData.get('id'),
            name: formData.get('name'),
            number: formData.get('number'),
            bikes: formData.getAll('bikes[]').filter(bike => bike.trim() !== '')
        };

        const url = clientData.id ? `/api/clients/${clientData.id}` : '/api/clients';
        const method = clientData.id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save client');
            clientModal.style.display = 'none';
            fetchClients();
        })
        .catch(error => {
            console.error('Error saving client:', error);
            alert('Failed to save client. Please try again.');
        });
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchClients();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchClients();
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmationModal.style.display = 'none';
        itemToDelete = null;
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (itemToDelete) {
            fetch(`/api/clients/${itemToDelete}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to delete client');
                    deleteConfirmationModal.style.display = 'none';
                    itemToDelete = null;
                    fetchClients();
                })
                .catch(error => {
                    console.error('Error deleting client:', error);
                    alert('Failed to delete client. Please try again.');
                });
        }
    });

    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    fetchClients();

    window.onclick = function(event) {
        if (event.target == clientModal) {
            clientModal.style.display = "none";
        }
        if (event.target == deleteConfirmationModal) {
            deleteConfirmationModal.style.display = "none";
        }
    }
});