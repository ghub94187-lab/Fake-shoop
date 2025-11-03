let currentUser = null;
let totalRequests = parseInt(localStorage.getItem('requests') || '0');
const MAX = 200;

const products = [
    { name: 'iPhone 15 Pro', price: 999, img: 'https://via.placeholder.com/300x200?text=iPhone+15', category: 'electronics' },
    { name: 'Galaxy S24', price: 849, img: 'https://via.placeholder.com/300x200?text=Galaxy+S24', category: 'electronics' },
    { name: 'MacBook Air', price: 1299, img: 'https://via.placeholder.com/300x200?text=MacBook', category: 'electronics' },
    { name: 'Sony Headphones', price: 399, img: 'https://via.placeholder.com/300x200?text=Headphones', category: 'electronics' },
    { name: 'Nike Shoes', price: 150, img: 'https://via.placeholder.com/300x200?text=Nike', category: 'clothing' },
    { name: 'Adidas Jacket', price: 89, img: 'https://via.placeholder.com/300x200?text=Adidas', category: 'clothing' },
    { name: 'JS Book', price: 49, img: 'https://via.placeholder.com/300x200?text=JS+Book', category: 'books' },
    { name: 'Python Book', price: 39, img: 'https://via.placeholder.com/300x200?text=Python', category: 'books' }
];

function updateCounter() {
    document.getElementById('counter').textContent = totalRequests;
    localStorage.setItem('requests', totalRequests);
    if (totalRequests >= MAX) {
        document.getElementById('shop-section').classList.add('d-none');
        document.getElementById('admin-section').classList.add('d-none');
        document.getElementById('crash-section').classList.remove('d-none');
    }
}

function loadProducts(cat = 'all') {
    const row = document.getElementById('products-row');
    row.innerHTML = '';
    products.filter(p => cat === 'all' || p.category === cat).forEach(p => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card product-card h-100">
                <img src="${p.img}" class="card-img-top" alt="${p.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${p.name}</h5>
                    <p class="text-danger fw-bold mt-auto">$${p.price}</p>
                    <button class="btn btn-success" onclick="buy('${p.name}')">Buy Now</button>
                </div>
            </div>
        `;
        row.appendChild(col);
    });
}

function buy(name) {
    if (totalRequests >= MAX || !currentUser) return;
    totalRequests++;
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users[currentUser]) users[currentUser] = { purchases: [], requests: 0 };
    users[currentUser].purchases.push(name);
    users[currentUser].requests++;
    localStorage.setItem('users', JSON.stringify(users));
    updateCounter();
    alert(`Bought ${name}! Request #${totalRequests}`);
}

function loadAdmin() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    let i = 1;
    for (let u in users) {
        tbody.innerHTML += `<tr><td>${i++}</td><td>${u}</td><td>${users[u].purchases.join(', ')}</td><td>${users[u].requests}</td></tr>`;
    }
}

document.getElementById('login-form').onsubmit = e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) return alert('Fill fields!');
    currentUser = username;
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users[username]) users[username] = { purchases: [], requests: 0 };
    localStorage.setItem('users', JSON.stringify(users));

    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('logout-link').style.display = 'block';
    document.getElementById('logout-link').onclick = () => location.reload();

    if (username === 'admin' && password === 'admin123') {
        document.getElementById('admin-section').classList.remove('d-none');
        loadAdmin();
        alert('Admin access granted!');
    } else {
        document.getElementById('shop-section').classList.remove('d-none');
        loadProducts();
        updateCounter();
        alert(`Welcome ${username}!`);
    }
};

document.querySelectorAll('#category-tabs .nav-link').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('#category-tabs .nav-link').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loadProducts(tab.dataset.category);
    };
});

function resetSiteForDemo() {
    if (confirm('Reset counter?')) {
        totalRequests = 0;
        updateCounter();
        document.getElementById('crash-section').classList.add('d-none');
        document.getElementById('shop-section').classList.remove('d-none');
    }
}

function resetAllData() {
    if (confirm('Reset everything?')) {
        localStorage.clear();
        totalRequests = 0;
        updateCounter();
        loadAdmin();
    }
}

updateCounter();
if (totalRequests >= MAX) document.getElementById('crash-section').classList.remove('d-none');
