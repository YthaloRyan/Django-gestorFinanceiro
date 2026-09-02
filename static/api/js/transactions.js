async function loadTransactions() {
    const month = document.getElementById('month-filter').value;
    const year = document.getElementById('year-filter').value;

    let url = '/api/transactions/';
    const params = [];
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (params.length) url += `?${params.join('&')}`;

    const response = await fetch(url);
    const transactions = await response.json();

    const container = document.getElementById('transactions-list');
    container.innerHTML = '';

    transactions.forEach(t => {
        const item = document.createElement('div');
        item.classList.add('transaction-item');
        item.innerHTML = `
            <span>${t.date}</span>
            <span>${t.category}</span>
            <span>${t.description}</span>
            <span>${t.type === 'IN' ? '+' : '-'} R$ ${t.amount}</span>
            <button class="btn-delete-transaction" data-id="${t.id}" type="button"> X </button>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.btn-delete-transaction').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            deleteTransaction(id);
        });
    });


}


function deleteTransaction(id) {
    fetch(`/api/transactions/${id}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken // supondo que csrf.js exponha isso
        }
    })
    .then(response => {
        if (response.ok) {
            loadTransactions();
            loadYears();
            // recarrega a lista, ou remove o item do DOM diretamente
        } else {
            console.error('Erro ao excluir transação');
        }
    });
}


async function loadYears() {
    const response = await fetch('/api/transactions/available_years/');
    const years = await response.json();

    const currentYear = new Date().getFullYear();

    // garante que o ano atual sempre apareça, mesmo sem transações ainda
    const yearSet = new Set([currentYear, ...years]);
    const sortedYears = [...yearSet].sort((a, b) => b - a);

    const select = document.getElementById('year-filter');
    select.innerHTML = '<option value="">Todos os anos</option>';

    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    });

    select.value = currentYear;
}


document.getElementById('transaction-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);

    if (amount <= 0) {
        alert('O valor precisa ser maior que zero.');
        return;
    }

    const date_value = document.getElementById('date').value;

    const data = {
        description: document.getElementById('description').value,
        amount: amount,
        type: document.getElementById('type').value,
        category: document.getElementById('transaction-category').value,
        date: date_value,
    };

    console.log(data);

    const response = await fetch('/api/transactions/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        loadTransactions();
        document.getElementById('amount').value = ''; // mantém a data selecionada
        document.getElementById('desdescription').value = '';
    } else {
        const error = await response.json();
        console.error('Erro ao criar transação:', error);
        alert('Erro ao salvar. Confira os campos.');
    }
});


document.getElementById('month-filter').addEventListener('change', loadTransactions);
document.getElementById('year-filter').addEventListener('change', loadTransactions);

document.addEventListener('DOMContentLoaded', async () => {
    await loadYears();  // espera popular o select de anos primeiro

    const now = new Date();
    document.getElementById('month-filter').value = now.getMonth() + 1;

    const today = now.toISOString().split('T')[0];
    document.getElementById('date').value = today;

    loadTransactions();
    loadCategories();
});