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

        console.log(t.amount)
        const amount = Number(t.amount).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        console.log(amount); // Log para depuração

        const item = document.createElement('div');
        item.classList.add('transaction-item');
        item.innerHTML = `
            <span>${t.date}</span>
            <span>${document.querySelector(`#transaction-category option[value="${t.category}"]`)?.textContent || ''}</span>
            <span>${t.description}</span>
            <span>${t.type === 'IN' ? '+' : '-'} ${amount}</span>
            <button class="btn-edit-transaction" data-id="${t.id}" type="button"> E </button>
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

async function accumulatedBalance() {
    const month = document.getElementById('month-filter').value;
    const year = document.getElementById('year-filter').value;


    let url = '/api/transactions/accumulated_balance/';
    const params = [];
    params.push(`month=${month}`);
    params.push(`year=${year}`);
    if (params.length) url += `?${params.join('&')}`;


    const response = await fetch(url);
    let balance = await response.json();

    balance = Number(balance).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const container = document.getElementById('accumulated-balance');
    container.textContent = `${balance}`;
}


function monthIncomeAndOutcome() {
    let list_transactions = document.getElementById('transactions-list');
    let transactions = list_transactions.querySelectorAll('.transaction-item');
    let income = 0;
    let outcome = 0;

    transactions.forEach(t => {
        const transaction = t.children[3].textContent.trim();
        
        const amount = parseFloat(
            transaction.replace(/[^\d,.-]/g, '') // remove tudo que não é dígito, vírgula, ponto ou sinal
                .replace('.', '').replace(',', '.')        // caso venha com vírgula decimal
        );

        const operator = transaction.charAt(0);


        
        if (operator === '+') {
            console.log('Income amount:', amount); // Log para depuração
            income += amount;
        } else {
            outcome += amount;
        }
    });

    console.log(`Income:   ${income}, Outcome: ${outcome}`); // Log para depuração


    income = income.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    outcome = outcome.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    document.getElementById('month-income').textContent = `${income}`;
    document.getElementById('month-outcome').textContent = `${outcome}`;
}



async function deleteTransaction(id) {
    fetch(`/api/transactions/${id}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    .then(async response => {
        if (response.ok) {
            await updatePage();
            await loadYears();
        } else {
            console.error('Erro ao excluir transação');
        }
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

    console.log('Amount to be sent:', amount); // Log para depuração

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