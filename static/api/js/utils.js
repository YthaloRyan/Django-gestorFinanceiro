export function dateParams(url) {
    const month = document.getElementById('month-filter').value;
    const year = document.getElementById('year-filter').value;


    const params = [];
    params.push(`month=${month}`);
    params.push(`year=${year}`);
    if (params.length) url += `?${params.join('&')}`;

    return url;
}


export function createButton(label, className, id) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.classList.add(className);
    btn.dataset.id = id;
    btn.type = 'button';
    return btn;
}


export function createSpan(text) {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
}