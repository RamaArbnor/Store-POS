const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// ── Database setup ────────────────────────────────────────────────────────────
const dbDir = path.join(app.getPath('appData'), 'storedb');
const dbPath = path.join(dbDir, 'store.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('DB connection failed:', err.message);
    else console.log('DB ready at', dbPath);
});

db.serialize(() => {
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

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            username   TEXT    NOT NULL UNIQUE,
            password   TEXT    NOT NULL,
            name       TEXT    NOT NULL,
            role       TEXT    NOT NULL DEFAULT 'cashier',
            created_at TEXT    DEFAULT (datetime('now', 'localtime'))
        )
    `);

    db.run(`INSERT OR IGNORE INTO users (username, password, name, role) VALUES ('admin', 'admin', 'Administrator', 'admin')`);

    db.run(`
        CREATE TABLE IF NOT EXISTS sales (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            total         REAL    NOT NULL,
            payment       REAL    NOT NULL,
            change_amount REAL    NOT NULL,
            user_id       INTEGER,
            user_name     TEXT,
            created_at    TEXT    DEFAULT (datetime('now', 'localtime'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS sale_items (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id         INTEGER NOT NULL,
            product_barcode TEXT,
            product_name    TEXT,
            quantity        REAL    NOT NULL,
            unit_price      REAL    NOT NULL,
            FOREIGN KEY (sale_id) REFERENCES sales(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS stock_receipts (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            notes      TEXT,
            user_id    INTEGER,
            user_name  TEXT,
            created_at TEXT    DEFAULT (datetime('now', 'localtime'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS stock_receipt_items (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            receipt_id      INTEGER NOT NULL,
            product_barcode TEXT,
            product_name    TEXT,
            quantity        INTEGER NOT NULL,
            FOREIGN KEY (receipt_id) REFERENCES stock_receipts(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS stock_adjustments (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            product_barcode TEXT,
            product_name    TEXT,
            quantity_before INTEGER NOT NULL,
            quantity_after  INTEGER NOT NULL,
            quantity_change INTEGER NOT NULL,
            reason          TEXT,
            user_id         INTEGER,
            user_name       TEXT,
            created_at      TEXT    DEFAULT (datetime('now', 'localtime'))
        )
    `);
});

// ── Express API ───────────────────────────────────────────────────────────────
const server = express();
server.use(express.json());
server.use(cors());

// ── Auth ──────────────────────────────────────────────────────────────────────
server.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(401).json({ error: 'Kredencialet janë të gabuara' });
            res.json({ id: row.id, username: row.username, name: row.name, role: row.role });
        }
    );
});

// ── Products ──────────────────────────────────────────────────────────────────
server.get('/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY name', (err, rows) => {
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
        [p.name, p.price, p.stock || 0, p.brand || null, p.category || null, p.description || null, p.barcode],
        (err) => {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Barkodi ekziston tashmë' });
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Produkti u shtua' });
        }
    );
});

server.put('/products/:barcode', (req, res) => {
    const p = req.body;
    db.run(
        'UPDATE products SET name = ?, price = ?, stock = ?, brand = ?, category = ?, description = ? WHERE barcode = ?',
        [p.name, p.price, p.stock, p.brand || null, p.category || null, p.description || null, req.params.barcode],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Produkti u ndryshua' });
        }
    );
});

server.delete('/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Produkti u fshi' });
    });
});

// ── Sales ─────────────────────────────────────────────────────────────────────
server.put('/sell', (req, res) => {
    const { products, total, payment, change, userId, userName } = req.body;

    db.run(
        'INSERT INTO sales (total, payment, change_amount, user_id, user_name) VALUES (?, ?, ?, ?, ?)',
        [total, payment, change, userId || null, userName || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const saleId = this.lastID;

            (products || []).forEach((p) => {
                db.run(
                    'INSERT INTO sale_items (sale_id, product_barcode, product_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
                    [saleId, p.barcode, p.name, p.quantity, p.price],
                    (e) => { if (e) console.error('sale_items:', e.message); }
                );
                db.run(
                    'UPDATE products SET stock = stock - ? WHERE barcode = ?',
                    [p.quantity, p.barcode],
                    (e) => { if (e) console.error('stock dec:', e.message); }
                );
            });

            res.json({ message: 'Shitja u regjistrua', saleId });
        }
    );
});

server.get('/sales', (req, res) => {
    const { from, to } = req.query;
    const fromDate = from ? from + ' 00:00:00' : '2000-01-01 00:00:00';
    const toDate   = to   ? to   + ' 23:59:59' : '2999-12-31 23:59:59';

    db.all(
        `SELECT s.*, COUNT(si.id) as item_count
         FROM sales s
         LEFT JOIN sale_items si ON s.id = si.sale_id
         WHERE s.created_at >= ? AND s.created_at <= ?
         GROUP BY s.id
         ORDER BY s.created_at DESC`,
        [fromDate, toDate],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

server.get('/sales/:id/items', (req, res) => {
    db.all('SELECT * FROM sale_items WHERE sale_id = ?', [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ── Users ─────────────────────────────────────────────────────────────────────
server.get('/users', (req, res) => {
    db.all('SELECT id, username, name, role, created_at FROM users ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

server.post('/users', (req, res) => {
    const { username, password, name, role } = req.body;
    db.run(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        [username, password, name, role || 'cashier'],
        (err) => {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Emri i përdoruesit ekziston' });
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Përdoruesi u krijua' });
        }
    );
});

server.put('/users/:id', (req, res) => {
    const { username, password, name, role } = req.body;
    if (password) {
        db.run(
            'UPDATE users SET username = ?, password = ?, name = ?, role = ? WHERE id = ?',
            [username, password, name, role, req.params.id],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Përdoruesi u ndryshua' });
            }
        );
    } else {
        db.run(
            'UPDATE users SET username = ?, name = ?, role = ? WHERE id = ?',
            [username, name, role, req.params.id],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Përdoruesi u ndryshua' });
            }
        );
    }
});

server.delete('/users/:id', (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Përdoruesi u fshi' });
    });
});

// ── Stock Receive ─────────────────────────────────────────────────────────────
server.post('/stock/receive', (req, res) => {
    const { items, notes, userId, userName } = req.body;

    db.run(
        'INSERT INTO stock_receipts (notes, user_id, user_name) VALUES (?, ?, ?)',
        [notes || null, userId || null, userName || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const receiptId = this.lastID;

            (items || []).forEach((item) => {
                db.run(
                    'INSERT INTO stock_receipt_items (receipt_id, product_barcode, product_name, quantity) VALUES (?, ?, ?, ?)',
                    [receiptId, item.barcode, item.name, item.quantity],
                    (e) => { if (e) console.error('receipt_items:', e.message); }
                );
                db.run(
                    'UPDATE products SET stock = stock + ? WHERE barcode = ?',
                    [item.quantity, item.barcode],
                    (e) => { if (e) console.error('stock inc:', e.message); }
                );
            });

            res.json({ message: 'Stoku u pranua', receiptId });
        }
    );
});

server.get('/stock/receipts', (req, res) => {
    const { from, to } = req.query;
    const fromDate = from ? from + ' 00:00:00' : '2000-01-01 00:00:00';
    const toDate   = to   ? to   + ' 23:59:59' : '2999-12-31 23:59:59';

    db.all(
        `SELECT r.*, COUNT(ri.id) as item_count, COALESCE(SUM(ri.quantity), 0) as total_qty
         FROM stock_receipts r
         LEFT JOIN stock_receipt_items ri ON r.id = ri.receipt_id
         WHERE r.created_at >= ? AND r.created_at <= ?
         GROUP BY r.id
         ORDER BY r.created_at DESC`,
        [fromDate, toDate],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

server.get('/stock/receipts/:id', (req, res) => {
    db.all('SELECT * FROM stock_receipt_items WHERE receipt_id = ?', [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ── Stock Adjust ──────────────────────────────────────────────────────────────
server.post('/stock/adjust', (req, res) => {
    const { barcode, newQty, reason, userId, userName } = req.body;

    db.get('SELECT * FROM products WHERE barcode = ?', [barcode], (err, product) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!product) return res.status(404).json({ error: 'Produkti nuk u gjet' });

        const before = product.stock;
        const after  = parseInt(newQty, 10);
        const change = after - before;

        db.run('UPDATE products SET stock = ? WHERE barcode = ?', [after, barcode], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.run(
                `INSERT INTO stock_adjustments
                    (product_barcode, product_name, quantity_before, quantity_after, quantity_change, reason, user_id, user_name)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [barcode, product.name, before, after, change, reason || null, userId || null, userName || null],
                (e) => { if (e) console.error('adj insert:', e.message); }
            );

            res.json({ message: 'Stoku u rregullua' });
        });
    });
});

server.get('/stock/adjustments', (req, res) => {
    const { from, to } = req.query;
    const fromDate = from ? from + ' 00:00:00' : '2000-01-01 00:00:00';
    const toDate   = to   ? to   + ' 23:59:59' : '2999-12-31 23:59:59';

    db.all(
        `SELECT * FROM stock_adjustments
         WHERE created_at >= ? AND created_at <= ?
         ORDER BY created_at DESC`,
        [fromDate, toDate],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ── Dashboard stats ───────────────────────────────────────────────────────────
server.get('/dashboard/stats', (req, res) => {
    const stats = {};

    db.get(
        `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
         FROM sales WHERE date(created_at) = date('now', 'localtime')`,
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.today_transactions = row.count;
            stats.today_revenue      = row.total;

            db.get(
                `SELECT COALESCE(SUM(total), 0) as total FROM sales
                 WHERE created_at >= date('now', 'localtime', 'start of month')`,
                (err, row) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.month_revenue = row.total;

                    db.get('SELECT COUNT(*) as count FROM products WHERE stock <= 10', (err, row) => {
                        if (err) return res.status(500).json({ error: err.message });
                        stats.low_stock = row.count;

                        db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
                            if (err) return res.status(500).json({ error: err.message });
                            stats.total_products = row.count;

                            db.all(
                                `SELECT s.*, COUNT(si.id) as item_count
                                 FROM sales s
                                 LEFT JOIN sale_items si ON s.id = si.sale_id
                                 GROUP BY s.id
                                 ORDER BY s.created_at DESC
                                 LIMIT 10`,
                                (err, rows) => {
                                    if (err) return res.status(500).json({ error: err.message });
                                    stats.recent_sales = rows;
                                    res.json(stats);
                                }
                            );
                        });
                    });
                }
            );
        }
    );
});

server.listen(5000, () => console.log('API running on :5000'));

// ── Electron window ───────────────────────────────────────────────────────────
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
