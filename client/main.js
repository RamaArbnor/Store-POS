const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// ── Database setup ──────────────────────────────────────────────────────────
const dbDir = path.join(app.getPath('appData'), 'storedb');
const dbPath = path.join(dbDir, 'store.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('DB connection failed:', err.message);
    else console.log('DB ready at', dbPath);
});

db.run(`
    CREATE TABLE IF NOT EXISTS products (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        price       REAL    NOT NULL,
        stock       INTEGER NOT NULL DEFAULT 0,
        brand       TEXT,
        category    TEXT,
        description TEXT,
        barcode     TEXT    UNIQUE
    )
`);

// ── Express API ─────────────────────────────────────────────────────────────
const server = express();
server.use(express.json());
server.use(cors());

server.get('/products', (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

server.get('/products/:barcode', (req, res) => {
    db.get('SELECT * FROM products WHERE barcode = ?', [req.params.barcode], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

server.post('/products', (req, res) => {
    const p = req.body;
    db.run(
        'INSERT INTO products (name, price, stock, brand, category, description, barcode) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.price, p.stock, p.brand, p.category, p.description, p.barcode],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product added' });
        }
    );
});

server.put('/products/:barcode', (req, res) => {
    const p = req.body;
    db.run(
        'UPDATE products SET name = ?, price = ?, stock = ?, brand = ?, category = ?, description = ? WHERE barcode = ?',
        [p.name, p.price, p.stock, p.brand, p.category, p.description, req.params.barcode],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product updated' });
        }
    );
});

server.delete('/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted' });
    });
});

server.put('/sell', (req, res) => {
    const products = req.body;
    products.forEach((p) => {
        db.run(
            'UPDATE products SET stock = stock - ? WHERE barcode = ?',
            [p.quantity, p.barcode],
            (err) => { if (err) console.error(err); }
        );
    });
    res.json({ message: 'Sale recorded' });
});

server.listen(5000, () => console.log('API running on :5000'));

// ── Electron window ─────────────────────────────────────────────────────────
function createWindow() {
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, 'build', 'index.html'),
        protocol: 'file:',
        slashes: true,
    });

    win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
