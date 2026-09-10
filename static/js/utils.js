export async function httpGet(theUrl) {
    try {
        const response = await fetch(theUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        return data;

    } catch (error) {
        console.error('Erro ao fazer a solicitação:', error);
    }
}

export async function httpDelete(theUrl)  {
    if (!confirm("Are you sure you want to delete this item?")) {
        return;
    }

    await fetch(theUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => {
        if (response.ok) {
            return response;
        } else {
            console.log(Error);
            throw new Error("Error deleting item.");
        }
    })
}