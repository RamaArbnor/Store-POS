import "../App.css";
import React, { useEffect, useState } from 'react';
// import sqlite3 from 'sqlite3';

export default function Home() {
  
  let addRow = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      console.log(e.target.innerText);
      let barcode = e.target.innerText;

    let sql = "SELECT * FROM products WHERE barcode = " + barcode;

    // search sqlite db for barcode

    }
  };

//   useEffect(() => {
//     const db = new sqlite3.Database('../../storedb/storedb.db', sqlite3.OPEN_READWRITE, (err) => {
//       if (err) {
//         console.error(err.message);
//       } else {
//         console.log('Connected to the database.');
//       }
//     });

//     // db.all('SELECT * FROM your_table', [], (err, rows) => {
//     //   if (err) {
//     //     console.error(err.message);
//     //   } else {
//     //     // setData(rows);
//     //     console.log(rows)
//     //   }
//     // });

//     return () => {
//       db.close((err) => {
//         if (err) {
//           console.error(err.message);
//         } else {
//           console.log('Closed the database connection.');
//         }
//       });
//     };
//   }, []);

  return (
    <div>
      {/* table  */}
      <table>
        <tr>
          <th>Barcode</th>
          <th>Emri</th>
          <th>Sasia</th>
          <th>Cmimi</th>
          <th>Column 5</th>
          <th>Column 6</th>
        </tr>
        <tr>
          <td contentEditable="true" onKeyDown={(e) => addRow(e)}></td>
          <td contentEditable="true"></td>
          <td contentEditable="true"></td>
          <td contentEditable="true"></td>
          <td contentEditable="true"></td>
          <td contentEditable="true"></td>
        </tr>
        <tr></tr>
      </table>
    </div>
  );
}
