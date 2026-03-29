const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const dbDir = path.join(app.getPath('appData'), 'storedb');
const dbPath = path.join(dbDir, 'store.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    }
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

const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');
const url = require('url');

const server = express();

server.use(express.static('public'));
server.use(express.json());
server.use(cors());

server.get('/products', (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});


server.get('/products/:barcode', (req, res) => {
    db.get('SELECT * FROM products WHERE barcode = ?', [req.params.barcode], (err, row) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

//id, name, price, stock, brand, category, description, barcode
server.post('/products', (req, res) => {
    const product = req.body;
    db.run('INSERT INTO products (name, price, stock, brand, category, description, barcode) VALUES (?, ?, ?, ?, ?, ?, ?)', [product.name, product.price, product.stock, product.brand, product.category, product.description, product.barcode], (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product added' });
    });
});

server.put('/products/:barcode', (req, res) => {
    const product = req.body;
    db.run('UPDATE products SET name = ?, price = ?, stock = ?, brand = ?, category = ?, description = ? WHERE barcode = ?', [product.name, product.price, product.stock, product.brand, product.category, product.description, req.params.barcode], (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product updated' });
    });
});

server.delete('/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product deleted' });
    });
});

// update the stock amount when a sale is made
server.put('/sell', (req, res) => {
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

server.listen(PORT, () => {
   console.log(`Server is running on PORT: ${PORT}`);
});

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      enableRemoteModule:true,
      nodeIntegration: true,
    }
  })

  const reactAppUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  mainWindow.loadURL(reactAppUrl)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.