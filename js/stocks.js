document.addEventListener('DOMContentLoaded', function() {
    const stockTableBody = document.getElementById('stock-table-body');
    const filterInput = document.getElementById('filter-input');
    const newStockBtn = document.getElementById('new-stock-btn');
    const stockModal = document.getElementById('stock-modal');
    const stockForm = document.getElementById('stock-form');
    const cancelStockBtn = document.getElementById('cancel-stock');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');
    const stockModalTitle = document.getElementById('stock-modal-title');
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    let itemToDelete = null;
    
    // const serverUrl = "https://api-bike-sys.herokuapp.com";
    const serverUrl = "http://localhost:9004";

    let currentPage = 0;
    let totalPages = 1;

    function fetchStockItems() {
        const filter = filterInput.value;
        stockTableBody.innerHTML = '<tr><td colspan="7" class="py-4 px-6 text-center">Carregando...</td></tr>';
        fetch(`${serverUrl}/api/v1/stocks?pageIndex=${currentPage}&description=${filter}`)
            .then(response => response.json())
            .then(data => {
                const items = data.records;
                renderStockItems(items);
                const pageInfos = data.pageInfo;
                totalPages = pageInfos.totalPages;
                updatePagination(data);
            })
            .catch(error => {
                console.error('Error fetching stock items:', error);
                stockTableBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-red-500">Failed to load stock items. Please try again later.</td></tr>';
            })
    }

    function renderStockItems(items) {
        stockTableBody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'stock-item-row hover:bg-gray-100';
            row.innerHTML = `
                <td class="py-3 px-4">${escapeHtml(item.description)}</td>
                <td class="py-3 px-4">${item.amount}</td>
                <td class="py-3 px-4 text-right">
                    <button class="action-button edit-button" data-id="${item.id}">Editar</button>
                    <button class="action-button remove-button" data-id="${item.id}">Remover</button>
                </td>
            `;
            stockTableBody.appendChild(row);
        });

        // Add event listeners for edit and remove buttons
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', () => editStockItem(button.dataset));
        });
        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', () => removeStockItem(button.dataset.id));
        });
    }

    function editStockItem(item) {
        fetch(`${serverUrl}/api/v1/stocks/${item.id}`)
            .then(response => response.json())
            .then(resp => {
                const item = resp.record;
                document.getElementById('stock-id').value = item.id;
                document.getElementById('description').value = item.description;
                document.getElementById('amount').value = item.amount;
                stockModalTitle.textContent = 'Editar Item';
                stockModal.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Error fetching stock item:', error);
                alert('Failed to load stock item. Please try again.');
            });
    }

    function removeStockItem(id) {
        itemToDelete = id;
        deleteConfirmationModal.classList.remove('hidden');
    }

    filterInput.addEventListener('input', debounce(() => {
        currentPage = 0;
        fetchStockItems();
    }, 300));

    newStockBtn.addEventListener('click', () => {
        stockForm.reset();
        document.getElementById('stock-id').value = '';
        stockModalTitle.textContent = 'Novo Item';
        stockModal.classList.remove('hidden');
    });

    cancelStockBtn.addEventListener('click', () => {
        stockModal.classList.add('hidden');
    });

    stockForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const stockItem = Object.fromEntries(formData.entries());
        stockItem.amount = parseInt(stockItem.amount);

        const url = stockItem.id ? `${serverUrl}/api/v1/stocks/${stockItem.id}` : '/api/v1/stocks';
        const method = stockItem.id ? 'PATCH' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(stockItem),
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save stock item');
            stockModal.classList.add('hidden');
            fetchStockItems();
        })
        .catch(error => {
            console.error('Error saving stock item:', error);
            alert('Failed to save stock item. Please try again.');
        });
    });

    function updatePagination(data) {
        const pageInfo = data.pageInfo;
        prevPageBtn.disabled = !pageInfo.hasPrevious;
        nextPageBtn.disabled = pageInfo.hasNext;
    }

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            fetchServices();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        fetchServices();
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

    fetchStockItems();

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmationModal.classList.add('hidden');
        itemToDelete = null;
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (itemToDelete) {
            fetch(`/api/stock/${itemToDelete}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to remove stock item');
                    deleteConfirmationModal.classList.add('hidden');
                    itemToDelete = null;
                    fetchStockItems();
                })
                .catch(error => {
                    console.error('Error removing stock item:', error);
                    alert('Erro ao deletar item.');
                });
        }
    });

});