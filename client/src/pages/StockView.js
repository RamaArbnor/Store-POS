import "../App.css";
import React, { useEffect, useState } from "react";
import { MaterialReactTable } from "material-react-table";
import { Box, Button } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StockView() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();

  const deleteProduct = (rows) => {
    rows.forEach((row) => {
      axios
        .delete(`http://localhost:5000/products/${row.original.id}`)
        .then(() => window.location.reload());
    });
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/products")
      .then((res) => {
        setData(res.data);
        setColumns([
          { accessorKey: "id", header: "ID", size: 60 },
          { accessorKey: "barcode", header: "Barkodi", size: 140 },
          { accessorKey: "name", header: "Emri", size: 200 },
          {
            accessorKey: "price",
            header: "Cmimi (€)",
            size: 110,
            Cell: ({ cell }) => `${Number(cell.getValue()).toFixed(2)} €`,
          },
          { accessorKey: "stock", header: "Stoku", size: 90 },
          { accessorKey: "brand", header: "Brendi", size: 140 },
          { accessorKey: "category", header: "Kategori", size: 140 },
          { accessorKey: "description", header: "Pershkrimi", size: 220 },
        ]);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="stock-layout">
      <header className="pos-header">
        <div className="pos-header__brand">
          <div className="pos-header__logo">M</div>
          <h1 className="pos-header__title">Stoku i Produkteve</h1>
        </div>
      </header>
      <main className="stock-main">
        <MaterialReactTable
          data={data}
          columns={columns}
          enableRowSelection
          renderTopToolbarCustomActions={({ table }) => (
            <Box sx={{ display: "flex", gap: "0.6rem", p: "0.4rem" }}>
              <Button
                onClick={() => navigate("/")}
                variant="outlined"
                size="small"
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                ← Kthehu
              </Button>
              <Button
                disabled={
                  !table.getIsSomeRowsSelected() &&
                  !table.getIsAllRowsSelected()
                }
                onClick={() => deleteProduct(table.getSelectedRowModel().rows)}
                variant="contained"
                color="error"
                size="small"
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                Fshij të zgjedhurat
              </Button>
            </Box>
          )}
        />
      </main>
    </div>
  );
}
