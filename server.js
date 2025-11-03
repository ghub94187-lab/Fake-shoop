const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const COUNTER_FILE = path.join(__dirname, 'counter.txt');
const MAX = 200;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let totalRequests = 0;
if (fs.existsSync(COUNTER_FILE)) {
  totalRequests = parseInt(fs.readFileSync(COUNTER_FILE, 'utf-8').trim()) || 0;
}

function saveCounter() {
  fs.writeFileSync(COUNTER_FILE, totalRequests.toString());
}

let users = {}; // in-memory, reset on crash for demo

const products = [
  { id: 1, name: 'iPhone 15 Pro', price: 999, img: 'https://via.placeholder.com/300x200?text=iPhone+15', category: 'electronics' },
  { id: 2, name: 'Samsung Galaxy S24', price: 849, img: 'https://via.placeholder.com/300x200?text=Galaxy+S24', category: 'electronics' },
  { id: 3, name: 'MacBook Air M3', price: 1299, img: 'https://via.placeholder.com/300x200?text=MacBook+Air', category: 'electronics' },
  { id: 4, name: 'Sony Headphones', price: 399, img: 'https://via.placeholder.com/300x200?text=Headphones', category: 'electronics' },
  { id: 5, name: 'Nike Air Max', price: 150, img: 'https://via.placeholder.com/300x200?text=Nike+Shoes', category: 'clothing' },
  { id: 6, name: 'Adidas Jacket', price: 89, img: 'https://via.placeholder.com/300x200?text=Adidas', category: 'clothing' },
  { id: 7, name: 'JavaScript Book', price: 49, img: 'https://via.placeholder.com/300x200?text=JS+Book', category: 'books' },
  { id: 8, name: 'Python Guide', price: 39, img: 'https://via.placeholder.com/300x200?text=Python', category: 'books' }
];

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Enter credentials' });
  if (!users[username]) users[username] = { purchases: [], requests: 0 };
  const role = (username === 'admin' && password === 'admin123') ? 'admin' : 'user';
  res.json({ role, username });
});

app.get('/api/users', (req, res) => {
  const list = Object.keys(users).map(u => ({ username: u, purchases: users[u].purchases, requests: users[u].requests }));
  res.json(list);
});

app.post('/api/buy', (req, res) => {
  const { username, prodName } = req.body;
  if (!users[username]) return res.status(400).json({ error: 'Login first' });
  totalRequests++;
  users[username].requests++;
  users[username].purchases.push(prodName);
  saveCounter();
  if (totalRequests > MAX) {
    console.error('OVER 200 REQUESTS! CRASHING SERVER NOW...');
    res.json({ totalRequests, crashed: true });
    setTimeout(() => process.exit(1), 500); // REAL CRASH - server down!
  } else {
    res.json({ totalRequests });
  }
});

app.get('/api/counter', (req, res) => res.json({ totalRequests }));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Server live on ${PORT}. Crash at >${MAX} requests.`));
