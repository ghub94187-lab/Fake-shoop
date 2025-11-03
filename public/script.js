let currentUser = null;
const API = '';

async function api(url, options = {}) {
  try {
    const res = await fetch(API + url, { ...options, headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (e) {
    document.getElementById('crash-section').classList.remove('d-none');
    document.getElementById('shop-section').classList.add('d-none');
    document.getElementById('admin-section').classList.add('d-none');
    document.getElementById('login-section').classList.add('d-none');
    alert('Server is down! Real crash - check Render logs.');
    return null;
  }
}

document.getElementById('login-form').onsubmit = async e => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const data = await api('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  if (data) {
    currentUser = username;
    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('logout-link').style.display = 'block';
    document.getElementById('logout-link').onclick = () => location.reload();
    if (data.role === 'admin') {
      document.getElementById('admin-section').classList.remove('d-none');
      loadAdmin();
    } else {
      document.getElementById('shop-section').classList.remove('d-none');
      loadProducts();
    }
    updateCounter();
  }
};

async function loadProducts(category = 'all') {
  const products = await api('/api/products') || [];
  const row = document.getElementById('products-row');
  row.innerHTML = '';
  products.filter(p => category === 'all' || p.category === category).forEach(p => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `<div class="card h-100">
      <img src="${p.img}" class="card-img-top">
      <div class="card-body">
        <h5>${p.name}</h5>
        <p class="text-danger">$${p.price}</p>
        <button class="btn btn-success" onclick="buy('${p.name}')">Buy Now</button>
      </div>
    </div>`;
    row.appendChild(col);
  });
}

async function buy(prodName) {
  const data = await api('/api/buy', { method: 'POST', body: JSON.stringify({ username: currentUser, prodName }) });
  if (data) {
    alert(`Bought ${prodName} - #${data.totalRequests}`);
    updateCounter();
    if (data.crashed) alert('Server crashing now!');
  }
}

async function updateCounter() {
  const data = await api('/api/counter');
  if (data) document.getElementById('counter').textContent = data.totalRequests;
}

async function loadAdmin() {
  const users = await api('/api/users') || [];
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '';
  users.forEach((u, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${u.username}</td><td>${u.purchases.join(', ')}</td><td>${u.requests}</td>`;
    tbody.appendChild(tr);
  });
}

document.querySelectorAll('#category-tabs .nav-link').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#category-tabs .nav-link').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loadProducts(tab.dataset.category);
  });
});
