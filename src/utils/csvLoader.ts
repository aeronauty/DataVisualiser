// CSV Loading utilities for frontend-only data visualization

export interface CSVColumn {
  name: string;
  type: 'string' | 'number' | 'boolean';
  is_numeric: boolean;
}

export interface CSVData {
  data: any[];
  columns: CSVColumn[];
  total_rows: number;
}

/**
 * Parse CSV text into structured data
 */
export function parseCSV(csvText: string): CSVData {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}`);
      continue;
    }
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    rows.push(row);
  }

  // Infer column types from data
  const columns: CSVColumn[] = headers.map(header => {
    const sampleValues = rows.slice(0, Math.min(100, rows.length))
      .map(row => row[header])
      .filter(val => val !== '' && val !== null && val !== undefined);
    
    const isNumeric = sampleValues.length > 0 && sampleValues.every(val => {
      const num = parseFloat(val);
      return !isNaN(num) && isFinite(num);
    });

    return {
      name: header,
      type: isNumeric ? 'number' : 'string',
      is_numeric: isNumeric
    };
  });

  // Convert numeric columns to numbers
  const processedRows = rows.map(row => {
    const processedRow: any = {};
    columns.forEach(col => {
      const value = row[col.name];
      if (col.is_numeric && value !== '' && value !== null && value !== undefined) {
        processedRow[col.name] = parseFloat(value);
      } else {
        processedRow[col.name] = value;
      }
    });
    return processedRow;
  });

  return {
    data: processedRows,
    columns,
    total_rows: processedRows.length
  };
}

/**
 * Load CSV file from URL or file input
 */
export async function loadCSVFromURL(url: string): Promise<CSVData> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    throw new Error(`Error loading CSV from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load CSV from File object (for file uploads)
 */
export async function loadCSVFromFile(file: File): Promise<CSVData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const result = parseCSV(csvText);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Get default sample datasets available in the project
 */
export const SAMPLE_DATASETS = [
  {
    name: 'comprehensive_business_data',
    description: 'Comprehensive business performance data with financial, operational, and market metrics',
    url: '/sample-data/comprehensive-business-data.csv',
    size: 60,
    columns: ['revenue', 'profit', 'employees', 'customers', 'satisfaction', 'market_share', 'growth_rate']
  },
  {
    name: 'business_metrics',
    description: 'Business metrics by company, department, and quarter',
    url: '/sample-data/business-metrics.csv',
    size: 25,
    columns: ['company', 'department', 'region', 'revenue', 'profit', 'employees']
  },
  {
    name: 'employee_metrics',
    description: 'HR metrics including satisfaction, productivity, and performance data',
    url: '/sample-data/employee-metrics.csv',
    size: 21,
    columns: ['employee_id', 'department', 'satisfaction_score', 'productivity_score', 'salary']
  },
  {
    name: 'test_data',
    description: 'Simple test dataset with employee information',
    url: '/test_data.csv',
    size: 11,
    columns: ['name', 'age', 'salary', 'department']
  }
];

/**
 * Load a sample dataset by name
 */
export async function loadSampleDataset(datasetName: string): Promise<CSVData> {
  const dataset = SAMPLE_DATASETS.find(d => d.name === datasetName);
  if (!dataset) {
    throw new Error(`Sample dataset '${datasetName}' not found`);
  }
  return loadCSVFromURL(dataset.url);
}
