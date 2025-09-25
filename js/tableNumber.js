function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const tableNumber = getQueryParam('table');

if (tableNumber) {
    // Обновляем ссылки
    document.getElementById('english-link').href = `./menu-en.html?table=${tableNumber}`;
    document.getElementById('russian-link').href = `./menu-ru.html?table=${tableNumber}`;
    
    console.log('Номер стола:', tableNumber);
} else {
    console.log('Номер стола не указан');
}

