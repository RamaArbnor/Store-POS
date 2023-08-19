import "../App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import sqlite3 from 'sqlite3';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [i, setI] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [change, setChange] = useState(0.0);
  const [canPay, setCanPay] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [newProduct, setNewProduct] = useState({
    barcode: "",
    name: "",
    stock: "",
    price: "",
    brand: "",
    category: "",
    description: "",
  });
  const [showUpdate, setShowUpdate] = useState(false);
  const [toUpdateProduct, setToUpdateProduct] = useState({});
  const [tempProduct, setTempProduct] = useState({});

  const navigate = useNavigate();

  let addRow = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false && e.target.innerText != "") {
      e.preventDefault();
      // console.log(e.target.innerText);
      let barcode = e.target.innerText;

      axios.get("http://localhost:5000/products/" + barcode).then((res) => {
        console.log(res.data);
        if (res.data) {
          setProducts([
            ...products,
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
          e.target.innerText = "";
          setI(i + 1);
        }
      });
    }
    setTotal(calculateTotal());
  };

  let addRowToUpd = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false && e.target.innerText != "") {
      e.preventDefault();
      // console.log(e.target.innerText);
      let barcode = e.target.innerText;
      axios.get("http://localhost:5000/products/" + barcode).then((res) => {
        if (res.data) {
          setToUpdateProduct({
            ...toUpdateProduct,
            barcode: res.data.barcode,
            name: res.data.name,
            stock: res.data.stock,
            price: res.data.price,
            brand: res.data.brand,
            category: res.data.category,
            description: res.data.description,
          });
          setTempProduct(toUpdateProduct);
          // e.target.innerText = "";
        } 
      });
    }
  };

  //when products change recalculate total
  useEffect(() => {
    setTotal(calculateTotal());
  }, [products]);

  let changeQuantity = (e, id) => {
    if (e.keyCode == 13 && e.shiftKey == false && e.target.innerText != "") {
      e.preventDefault();
      let quantity = parseFloat(e.target.innerText);
      let newProducts = products.map((product) => {
        if (product.id == id) {
          product.quantity = quantity;
        }
        return product;
      });
      setProducts(newProducts);
      setTotal(calculateTotal());
      console.log(total);
    }
  };

  let calculateTotal = () => {
    let total = 0;
    products.forEach((product) => {
      total += product.quantity * product.price;
    });
    return total;
  };

  let calculateChange = (e) => {
    let pay = parseFloat(e.target.value);
    let change = pay - total;
    setChange(change);

    if (change >= 0) {
      setCanPay(true);
    } else {
      setCanPay(false);
    }
  };

  let completeSale = () => {
    //print receipt
    //save to db
    //clear products
    axios.put("http://localhost:5000/sell", products).then((res) => {
      console.log(res.data);
    });

    setProducts([]);
    setI(1);
    setShowConfirm(false);
  };

  let deleteProduct = (id) => {
    let newProducts = products.filter((product) => {
      return product.id != id;
    });
    setProducts(newProducts);
  };

  let registerProduct = (e) => {
    //save to db
    e.preventDefault();
    // console.log(newProduct);
    axios.post("http://localhost:5000/products", newProduct).then((res) => {
      console.log(res.data);
      setShowRegister(false);
    });
  };

  let updateProduct = (e) => {
    e.preventDefault();
    // console.log(toUpdateProduct)
    axios
      .put(
        "http://localhost:5000/products/" + toUpdateProduct.barcode,
        toUpdateProduct
      )
      .then((res) => {
        console.log(res.data);
        setToUpdateProduct({});
        setTempProduct({});
        setShowRegister(false);
      });
  };

  let cancelUpdate = (e) => {
    e.preventDefault();
    setToUpdateProduct({});
    setTempProduct({});
    setShowUpdate(false);
  };

  return (
    <div>
      {showConfirm && (
        <div className="payPopUp">
          <form className="payPopUpContent">
            <h1>Pagesa</h1>
            <h2>Totali: {total} €</h2>
            <h2>Pagesa: </h2>
            <input type="number" onChange={(e) => calculateChange(e)} />
            <h2>Kusuri: {change} €</h2>
            <div className="payPopUpButtons">
              <button
                className="pay"
                onClick={() => completeSale()}
                disabled={!canPay}
              >
                Paguaj
              </button>
              <button
                type="submit"
                className="cancel"
                onClick={() => setShowConfirm(false)}
              >
                Anulo
              </button>
            </div>
          </form>
        </div>
      )}

      {showRegister && (
        <div className="payPopUp">
          <div
            className="payPopUpContent"
            style={{ width: "80%", padding: "2rem" }}
          >
            <h1>Regjistrimi</h1>
            <form className="registerContent">
              <div className="registerInfo">
                {/* , , , , category, description,  */}
                <h2>Barkodi: </h2>
                {/* onchange set the barcode of the newproduct object to the value of the input */}
                <input
                  type="number"
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, barcode: e.target.value });
                  }}
                />
                <h2>Emri: </h2>
                <input
                  type="text"
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
                <h2>Sasia: </h2>
                <input
                  type="number"
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                />
                <h2>Cmimi: </h2>
                <input
                  type="number"
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                />

                <h2>Brendi: </h2>
                <input
                  type="text"
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, brand: e.target.value })
                  }
                />
                <h2>Kategori: </h2>
                <input
                  type="text"
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                />
                <h2>Pershkrimi: </h2>
                <input
                  type="text"
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="payPopUpButtons">
                <button className="pay" onClick={registerProduct}>
                  Regjistro
                </button>

                <button
                  className="cancel"
                  onClick={() => setShowRegister(false)}
                >
                  Anulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdate && (
        <div className="payPopUp">
          <div className="payPopUpContent">
            <h1>Update</h1>
            <form className="registerContent">
              <div className="registerInfo">
                <table>
                  <tr>
                    <th className="id-column"> </th>
                    <th>Barcode</th>
                    <th>Emri</th>
                    {/* <th>Sasia</th> */}
                    <th>Cmimi</th>
                    <th>Stoku</th>
                    <th>Pershkrimi</th>
                    <th>Brendi</th>
                    <th className="id-column">Del</th>
                  </tr>
                  <tr>
                    <td className="id-column"> </td>
                    <td
                      contentEditable="true"
                      onKeyDown={(e) => addRowToUpd(e)}
                      onInput={(e) =>
                        setToUpdateProduct({
                          ...toUpdateProduct,
                          barcode: e.target.textContent,
                        })
                      }
                    >
                      {tempProduct.barcode}
                    </td>
                    <td
                      contentEditable="true"
                      onInput={(e) =>
                        setToUpdateProduct({
                          ...toUpdateProduct,
                          name: e.target.textContent,
                        })
                      }
                    >
                      {tempProduct.name}
                    </td>
                    {/* <td contentEditable="true" onInput={(e) => setToUpdateProduct({...toUpdateProduct, quantity: e.target.textContent})}>{tempProduct.quantity}</td> */}
                    <td
                      contentEditable="true"
                      onInput={(e) =>
                        setToUpdateProduct({
                          ...toUpdateProduct,
                          price: e.target.textContent,
                        })
                      }
                    >
                      {tempProduct.price}
                    </td>
                    <td
                      contentEditable="true"
                      onInput={(e) =>
                        setToUpdateProduct({
                          ...toUpdateProduct,
                          stock: e.target.textContent,
                        })
                      }
                    >
                      {tempProduct.stock}
                    </td>
                    <td
                      contentEditable="true"
                      onInput={(e) =>
                        setToUpdateProduct({
                          ...toUpdateProduct,
                          description: e.target.textContent,
                        })
                      }
                    >
                      {tempProduct.description}
                    </td>
                    <td
                      contentEditable="true"
                      onInput={(e) =>
                        setToUpdateProduct({
                          ...toUpdateProduct,
                          stock: e.target.textContent,
                        })
                      }
                    >
                      {tempProduct.brand}
                    </td>

                    <td className="id-column"> </td>
                  </tr>
                </table>
              </div>
              <div className="payPopUpButtons">
                <button className="pay" onClick={updateProduct}>
                  Ruaj
                </button>

                <button className="cancel" onClick={cancelUpdate}>
                  Anulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="header">
        <div className="logo">
          <h1>Marketi SHPK !</h1>
        </div>
        <div className="total">
          <h2>Totali: {total} €</h2>
        </div>
      </div>
      {/* table  */}
      <table>
        <tr>
          <th className="id-column"> </th>
          <th>Barcode</th>
          <th>Emri</th>
          <th>Sasia</th>
          <th>Cmimi</th>
          <th>Pershkrimi</th>
          <th>Brendi</th>
          <th className="id-column">Del</th>
        </tr>
        <tr>
          <td className="id-column"> </td>
          <td contentEditable="true" onKeyDown={(e) => addRow(e)}></td>
          <td contentEditable="true"></td>
          <td contentEditable="true"></td>
          <td contentEditable="true"></td>
          <td contentEditable="true"></td>
          <td contentEditable="true"></td>
          <td className="id-column"></td>
        </tr>

        {products.map((product) => (
          <tr>
            <td className="id-column">{product.id}</td>
            <td>{product.barcode}</td>
            <td>{product.name}</td>
            <td
              contentEditable="true"
              onKeyDown={(e) => changeQuantity(e, product.id)}
            >
              {product.quantity}
            </td>
            <td>{product.price} €</td>
            <td>{product.description}</td>
            <td>{product.brand}</td>
            <td className="id-column">
              <button
                className="deleteRow"
                onClick={() => deleteProduct(product.id)}
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </table>
      <div className="utils">
      <div>
          <button className="register" onClick={() => setShowRegister(true)}>
            Shto
          </button>
          <button className="register" onClick={() => setShowUpdate(true)}>
            Ndrysho
          </button>
          <button className="register" onClick={() => navigate("/stock")}>
            Stoku
          </button>
        </div>
        <div>
          <button className="pay" onClick={() => setShowConfirm(true)}>
            Paguaj
          </button>
          {/* style={{backgroundColor: "#f44336"}} */}
          <button
            className="cancel"
            onClick={() => {
              setProducts([]);
              setI(1);
            }}
          >
            Anulo
          </button>
        </div>


      </div>
    </div>
  );
}
