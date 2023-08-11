const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../storedb/store.db');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');

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

// PORT
const PORT = 5000;

app.listen(PORT, () => {
   console.log(`Server is running on PORT: ${PORT}`);
});