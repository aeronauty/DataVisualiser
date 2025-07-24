import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-theme-quartz.css' // Use the new theme
import type { ColDef } from 'ag-grid-community'
import { useMemo } from 'react'

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule])

interface DataTableProps {
  data: any[]
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const columnDefs: ColDef[] = useMemo(() => {
    if (!data || data.length === 0) return []
    
    const firstRow = data[0]
    return Object.keys(firstRow).map(key => ({
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      // Format numbers with appropriate precision
      valueFormatter: (params) => {
        if (typeof params.value === 'number') {
          return Number.isInteger(params.value) 
            ? params.value.toString()
            : params.value.toFixed(2)
        }
        return params.value
      }
    }))
  }, [data])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), [])

  return (
    <div className="data-table-container">
      <div className="ag-theme-quartz" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={50}
          animateRows={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </div>
      <div className="table-info">
        <p>Total rows: {data.length}</p>
      </div>
    </div>
  )
}

export default DataTable
