import "../App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [i, setI] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [change, setChange] = useState(null);
  const [canPay, setCanPay] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [newProduct, setNewProduct] = useState({
    barcode: "", name: "", stock: "", price: "",
    brand: "", category: "", description: "",
  });
  const [showUpdate, setShowUpdate] = useState(false);
  const [toUpdateProduct, setToUpdateProduct] = useState({});

  const navigate = useNavigate();

  const addRow = (e) => {
    if (e.keyCode === 13 && !e.shiftKey && e.target.value !== "") {
      e.preventDefault();
      const barcode = e.target.value;
      axios.get("http://localhost:5000/products/" + barcode).then((res) => {
        if (res.data) {
          setProducts((prev) => [
            ...prev,
            {
              id: i,
              barcode: res.data.barcode,
              name: res.data.name,
              quantity: 1,
              stock: res.data.stock,
              price: res.data.price,
              description: res.data.description,
              category: res.data.category,
            },
          ]);
          e.target.value = "";
          setI((prev) => prev + 1);
        }
      });
    }
  };

  const addRowToUpd = (e) => {
    if (e.keyCode === 13 && !e.shiftKey && e.target.value !== "") {
      e.preventDefault();
      const barcode = e.target.value;
      axios.get("http://localhost:5000/products/" + barcode).then((res) => {
        if (res.data) {
          setToUpdateProduct({
            barcode: res.data.barcode,
            name: res.data.name,
            stock: res.data.stock,
            price: res.data.price,
            brand: res.data.brand,
            category: res.data.category,
            description: res.data.description,
          });
        }
      });
    }
  };

  useEffect(() => {
    setTotal(products.reduce((sum, p) => sum + p.quantity * p.price, 0));
  }, [products]);

  const changeQuantity = (id, value) => {
    const quantity = parseFloat(value) || 1;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity } : p)));
  };

  const calculateChange = (e) => {
    const pay = parseFloat(e.target.value) || 0;
    const c = pay - total;
    setChange(c);
    setCanPay(c >= 0);
  };

  const completeSale = () => {
    axios.put("http://localhost:5000/sell", products).then(() => {});
    setProducts([]);
    setI(1);
    setShowConfirm(false);
    setChange(null);
    setCanPay(false);
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const registerProduct = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/products", newProduct).then(() => {
      setShowRegister(false);
      setNewProduct({ barcode: "", name: "", stock: "", price: "", brand: "", category: "", description: "" });
    });
  };

  const updateProduct = (e) => {
    e.preventDefault();
    axios
      .put("http://localhost:5000/products/" + toUpdateProduct.barcode, toUpdateProduct)
      .then(() => {
        setToUpdateProduct({});
        setShowUpdate(false);
      });
  };

  const cancelUpdate = (e) => {
    e.preventDefault();
    setToUpdateProduct({});
    setShowUpdate(false);
  };

  return (
    <div className="pos-layout">

      {/* ── Payment Modal ── */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Pagesa</h2>
              <button className="modal__close" onClick={() => setShowConfirm(false)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="payment-summary">
                <div className="payment-row">
                  <span>Total</span>
                  <strong className="payment-amount">{total.toFixed(2)} €</strong>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Shuma e paguar</label>
                <input
                  type="number"
                  className="form-input form-input--xl"
                  placeholder="0.00"
                  onChange={calculateChange}
                  autoFocus
                />
              </div>
              {change !== null && (
                <div className={`payment-change ${change >= 0 ? "payment-change--positive" : "payment-change--negative"}`}>
                  <span>Kusuri</span>
                  <strong>{change.toFixed(2)} €</strong>
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowConfirm(false)}>Anulo</button>
              <button className="btn btn--primary btn--lg" onClick={completeSale} disabled={!canPay}>
                ✓ &nbsp;Paguaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Register Product Modal ── */}
      {showRegister && (
        <div className="modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Shto Produkt</h2>
              <button className="modal__close" onClick={() => setShowRegister(false)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Barkodi</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Emri</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sasia</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cmimi (€)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brendi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Pershkrimi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowRegister(false)}>Anulo</button>
              <button className="btn btn--primary" onClick={registerProduct}>Regjistro</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Update Product Modal ── */}
      {showUpdate && (
        <div className="modal-overlay" onClick={cancelUpdate}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Ndrysho Produkt</h2>
              <button className="modal__close" onClick={cancelUpdate}>✕</button>
            </div>
            <div className="modal__body">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Barkodi — skano ose shkruaj dhe shtyp Enter</label>
                <input
                  type="text"
                  className="form-input"
                  value={toUpdateProduct.barcode || ""}
                  onKeyDown={addRowToUpd}
                  onChange={(e) => setToUpdateProduct({ ...toUpdateProduct, barcode: e.target.value })}
                  placeholder="Skano barkod..."
                  autoFocus
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Emri</label>
                  <input
                    type="text"
                    className="form-input"
                    value={toUpdateProduct.name || ""}
                    onChange={(e) => setToUpdateProduct({ ...toUpdateProduct, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cmimi (€)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={toUpdateProduct.price || ""}
                    onChange={(e) => setToUpdateProduct({ ...toUpdateProduct, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stoku</label>
                  <input
                    type="number"
                    className="form-input"
                    value={toUpdateProduct.stock || ""}
                    onChange={(e) => setToUpdateProduct({ ...toUpdateProduct, stock: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brendi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={toUpdateProduct.brand || ""}
                    onChange={(e) => setToUpdateProduct({ ...toUpdateProduct, brand: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <input
                    type="text"
                    className="form-input"
                    value={toUpdateProduct.category || ""}
                    onChange={(e) => setToUpdateProduct({ ...toUpdateProduct, category: e.target.value })}
                  />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Pershkrimi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={toUpdateProduct.description || ""}
                    onChange={(e) => setToUpdateProduct({ ...toUpdateProduct, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={cancelUpdate}>Anulo</button>
              <button className="btn btn--primary" onClick={updateProduct}>Ruaj</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="pos-header">
        <div className="pos-header__brand">
          <div className="pos-header__logo">M</div>
          <h1 className="pos-header__title">Marketi SHPK</h1>
        </div>
        <div className="pos-header__total">
          <span className="pos-header__total-label">Totali</span>
          <span className="pos-header__total-amount">{total.toFixed(2)} €</span>
        </div>
      </header>

      {/* ── Product Table ── */}
      <main className="pos-main">
        <div className="pos-table-wrap">
          <table className="pos-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>Barcode</th>
                <th>Emri</th>
                <th className="col-qty">Sasia</th>
                <th className="col-price">Cmimi</th>
                <th>Pershkrimi</th>
                <th>Brendi</th>
                <th className="col-action"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="pos-table__scan-row">
                <td className="col-id">
                  <span className="scan-icon">⊕</span>
                </td>
                <td colSpan="6">
                  <input
                    type="text"
                    className="scan-input"
                    placeholder="Skano barkod ose shkruaj dhe shtyp Enter..."
                    onKeyDown={addRow}
                  />
                </td>
                <td></td>
              </tr>
              {products.map((product) => (
                <tr key={product.id} className="pos-table__row">
                  <td className="col-id col-id-cell">{product.id}</td>
                  <td>{product.barcode}</td>
                  <td className="col-name">{product.name}</td>
                  <td className="col-qty">
                    <input
                      type="number"
                      className="qty-input"
                      defaultValue={product.quantity}
                      min="1"
                      onChange={(e) => changeQuantity(product.id, e.target.value)}
                    />
                  </td>
                  <td className="col-price col-price-cell">{Number(product.price).toFixed(2)} €</td>
                  <td className="col-desc">{product.description}</td>
                  <td>{product.brand}</td>
                  <td className="col-action">
                    <button className="btn-delete" onClick={() => deleteProduct(product.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Action Footer ── */}
      <footer className="pos-footer">
        <div className="pos-footer__left">
          <button className="btn btn--secondary" onClick={() => setShowRegister(true)}>+ Shto</button>
          <button className="btn btn--secondary" onClick={() => setShowUpdate(true)}>✎ Ndrysho</button>
          <button className="btn btn--secondary" onClick={() => navigate("/stock")}>▤ Stoku</button>
        </div>
        <div className="pos-footer__right">
          <button
            className="btn btn--outline-danger"
            onClick={() => { setProducts([]); setI(1); }}
            disabled={products.length === 0}
          >
            Anulo
          </button>
          <button
            className="btn btn--primary btn--lg"
            onClick={() => setShowConfirm(true)}
            disabled={products.length === 0}
          >
            Paguaj &nbsp;{total.toFixed(2)} €
          </button>
        </div>
      </footer>

    </div>
  );
}
