async function loadCategories() {
    const response = await fetch('/api/categories/');

    
    const categories = await response.json();


    const select = document.getElementById('transaction-category');
    const select_delete = document.getElementById('category-delete');
    select.innerHTML = '';
    select_delete.innerHTML = '';

    
    categories.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        select.appendChild(option);

        const optionClone = option.cloneNode(true); // agora sim, um clone de verdade
        select_delete.appendChild(optionClone);
    });
}

document.getElementById('category-delete-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const categoryId = document.getElementById('category-delete').value;

    const response = await fetch(`/api/categories/${categoryId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken,
        },
    });

    if (response.ok) {
        loadCategories();
    } else {
        console.error('Erro ao excluir categoria');
        alert('Erro ao excluir categoria.');
    }
});


document.getElementById('category-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('category-name').value
    };

    const response = await fetch('/api/categories/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        document.getElementById('category-form').reset();
        loadCategories(); 
    } else {
        const error = await response.json();
        console.error('Erro ao criar categoria:', error);
        alert('Erro ao salvar. Confira os campos.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    loadCategories();
});