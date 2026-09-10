import { dateParams, createButton, createSpan } from '/static/api/js/utils.js';
import { httpGet, httpDelete } from '/static/js/utils.js';

async function loadTransactions() {
    // request transactions with date parameters
    let url = '/api/transactions/';
    url = dateParams(url);

    const transactions = await httpGet(url);

    const container = document.getElementById('transactions-list');
    container.innerHTML = '';

    // create a map of category ids to names for easy lookup
    const categoryMap = new Map(
        [...document.querySelectorAll('#transaction-category option')]
            .map(opt => [Number(opt.value), opt.textContent])
    );

    

    const fragment = document.createDocumentFragment();

    // iterate over transactions and create elements for each
    transactions.forEach(t => {
        const amount = floatToCurrency(t.amount);

        const item = document.createElement('div');

        item.classList.add('transaction-item');
        
        // add data attributes for easy access later
        item.append(
            createSpan(`${t.date}`),
            createSpan(`[${categoryMap.get(t.category) || ''}]`),
            createSpan(`${t.description}`),
            createSpan(`[${t.type === 'IN' ? '+' : '-'} ${amount}]`)
        );

        const btnEdit = createButton('E', 'btn-edit-transaction', t.id);
        const btnDelete = createButton('X', 'btn-delete-transaction', t.id);
        item.append(btnEdit, btnDelete);

        fragment.appendChild(item);
    });

    container.appendChild(fragment);
}

// event delegation for edit and delete buttons
document.getElementById('transactions-list').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.btn-delete-transaction');
    if (deleteBtn) {
        deleteTransaction(deleteBtn.dataset.id);
        return;
    }

    const editBtn = e.target.closest('.btn-edit-transaction');
    if (editBtn) {
        editTransaction(editBtn.dataset.id); 
    }
});


// calculate and display accumulated balance based on selected month and year
async function accumulatedBalance() {
    let url = '/api/transactions/accumulated_balance/';
    url = dateParams(url);

    let balance = await httpGet(url);
    balance = floatToCurrency(balance);

    const container = document.getElementById('accumulated-balance');
    container.textContent = `${balance}`;
}


// calculate and display monthly income and outcome based on selected month and year
function monthIncomeAndOutcome() {
    let list_transactions = document.getElementById('transactions-list');
    let transactions = list_transactions.querySelectorAll('.transaction-item');
    let income = 0;
    let outcome = 0;

    transactions.forEach(t => {
        const transaction = t.children[3].textContent.trim();
        
        const amount = parseFloat(
            transaction.replace(/[^\d,.-]/g, '')
                .replace('.', '').replace(',', '.')
        );

        const operator = transaction.charAt(0);


        
        if (operator === '+') {
            income += amount;
        } else {
            outcome += amount;
        }
    });


    income = floatToCurrency(income);
    outcome = floatToCurrency(outcome);

    document.getElementById('month-income').textContent = `${income}`;
    document.getElementById('month-outcome').textContent = `${outcome}`;
}



async function deleteTransaction(id) {
    await httpDelete(`/api/transactions/${id}/`);

    await updatePage();
    await loadYears();
}


async function editTransaction(id) {
    await fetch(`/api/transactions/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data),
    });
}


async function loadYears() {
    const selectedYear = document.getElementById('year-filter').value;
    const selectedMonth = document.getElementById('month-filter').value;
    const response = await fetch('/api/transactions/available_years/');
    const years = await response.json();

    const now = new Date();
    const currentYear = now.getFullYear();

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

    document.getElementById('year-filter').value = selectedYear;
    document.getElementById('month-filter').value = selectedMonth;

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


    const response = await fetch('/api/transactions/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        await updatePage();
        await loadYears();

        document.getElementById('amount').value = ''; // mantém a data selecionada
        document.getElementById('description').value = '';
    } else {
        const error = await response.json();
        console.error('Erro ao criar transação:', error);
        alert('Erro ao salvar. Confira os campos.');
    }
});

async function updatePage() {
    await loadTransactions();
    await accumulatedBalance();
    await monthIncomeAndOutcome();
}

function floatToCurrency(value) {
    return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}


document.getElementById('month-filter').addEventListener('change', updatePage);
document.getElementById('year-filter').addEventListener('change', updatePage);

document.addEventListener('DOMContentLoaded', async () => {
    await loadYears();
    await updatePage();

    const now = new Date();
    document.getElementById('month-filter').value = now.getMonth() + 1;

    const today = now.toISOString().split('T')[0];
    document.getElementById('date').value = today;


    const currentYear = now.getFullYear();

    const select_year = document.getElementById('year-filter');
    select_year.value = currentYear;

});