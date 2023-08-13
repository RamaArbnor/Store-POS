import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ExportToCsv } from 'export-to-csv'; //or use your library of choice here
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


//nested data is ok, see accessorKeys in ColumnDef below


export default function StockView() {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    const navigate = useNavigate();

    const csvOptions = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: false,
        headers: columns.map((c) => c.header),
      };

    const deleteProduct = (rows) => {
        rows.forEach((row) => {
            axios.delete(`http://localhost:5000/products/${row.original.id}`)
            .then(res => {
                // console.log(row);
                // console.log(res.data);
                setData(data.filter(item => item.id !== row.id));
                window.location.reload();
            })
        })
      };
    
      const handleExportData = () => {
        // csvExporter.generateCsv(data);
      };

    useEffect(() => {
        axios.get('http://localhost:5000/products')
            .then(res => {
                setData(res.data);
                setColumns( 
                    [
                      {
                        accessorKey: 'id', //access nested data with dot notation
                        header: 'ID',
                        size: 25,
                      },
                      {
                        accessorKey: 'barcode',
                        header: 'Barkodi',
                        size: 150,
                      },
                      {
                        accessorKey: 'name', //normal accessorKey
                        header: 'Emri',
                        size: 200,
                      },
                      {
                        accessorKey: 'stock',
                        header: 'Stoku',
                        size: 150,
                      },
                      {
                        accessorKey: 'brand',
                        header: 'Furnitori',
                        size: 150,
                      },
                      {
                        accessorKey: 'category',
                        header: 'Kategori',
                        size: 150,
                      },
                      {
                        accessorKey: 'description',
                        header: 'Pershkrimi',
                        size: 150,
                      },
                    ],
                    // name, price, stock, brand, category, description, barcode
                    [],
                  )
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);
    
    

    return (    
        <MaterialReactTable 
            data={data}
            columns={columns}
            title="Stoku"
            search={true}
            paging={true}
            pageSize={10}
            exportToCsv={true}
            exportToXlsx={true}
            exportToPdf={true}
            exportAllData={true}
            exportColumnData={true}
            exportFileName="Stoku"
            exportFileExtension="xlsx"
            exportData={data}
            enableRowSelection

      renderTopToolbarCustomActions={({ table }) => (
        <Box
          sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}
        >
            
            <Button
                onClick={() => navigate('/')}
                variant="contained"
            >Kthehu</Button>
          <Button
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
            //only export selected rows
            onClick={() => deleteProduct(table.getSelectedRowModel().rows)}
            startIcon={<FileDownloadIcon />}
            variant="contained"
          >
            Fshij Produktet
          </Button>
        </Box>
      )}
        />)

}