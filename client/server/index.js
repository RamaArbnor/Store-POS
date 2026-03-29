const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');

const dbDir = path.join(__dirname, 'storedb');
const dbPath = path.join(dbDir, 'store.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Connected to SQLite database at', dbPath);
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS products (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        name      TEXT    NOT NULL,
        price     REAL    NOT NULL,
        stock     INTEGER NOT NULL DEFAULT 0,
        brand     TEXT,
        category  TEXT,
        description TEXT,
        barcode   TEXT    UNIQUE
    )
`, (err) => {
    if (err) {
        console.error('Failed to create products table:', err.message);
    } else {
        console.log('Products table ready.');
    }
});

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.get('/products', (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});


app.get('/products/:barcode', (req, res) => {
    db.get('SELECT * FROM products WHERE barcode = ?', [req.params.barcode], (err, row) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

//id, name, price, stock, brand, category, description, barcode
app.post('/products', (req, res) => {
    const product = req.body;
    db.run('INSERT INTO products (name, price, stock, brand, category, description, barcode) VALUES (?, ?, ?, ?, ?, ?, ?)', [product.name, product.price, product.stock, product.brand, product.category, product.description, product.barcode], (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product added' });
    });
});

app.put('/products/:barcode', (req, res) => {
    const product = req.body;
    db.run('UPDATE products SET name = ?, price = ?, stock = ?, brand = ?, category = ?, description = ? WHERE barcode = ?', [product.name, product.price, product.stock, product.brand, product.category, product.description, req.params.barcode], (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product updated' });
    });
});

app.delete('/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product deleted' });
    });
});

// update the stock amount when a sale is made
app.put('/sell', (req, res) => {
    const products = req.body;
    // console.log(req)
    products.forEach(product => {
        //decrase the stock amount by products quantity
        db.run('UPDATE products SET stock = stock - ? WHERE barcode = ?', [product.quantity, product.barcode], (err) => {
            if (err) {
                console.log(err);
                res.status(500).json({ error: err.message });
            }
        });
    });
    
} )


// PORT
const PORT = 5000;

app.listen(PORT, () => {
   console.log(`Server is running on PORT: ${PORT}`);
});