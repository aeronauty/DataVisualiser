# Data Visualizer

A full-stack data visualization application that enables you to create, receive, and visualize data with a Python backend using Polars LazyFrames and a React frontend with Recharts and AG Grid.

## Features

### Frontend
- **Dual View Mode**: Switch between table view (AG Grid) and interactive chart view (Recharts)
- **Data Management**: Upload CSV files or load sample datasets
- **Customizable Visualizations**: Configure scatter plots with different:
  - X and Y axes
  - Category grouping
  - Point sizes
  - Color coding
- **Interactive Tables**: Full-featured data tables with sorting, filtering, and pagination
- **Real-time Updates**: Chart configurations update visualizations instantly

### Backend
- **FastAPI**: High-performance Python web framework
- **Polars LazyFrames**: Efficient data processing and manipulation
- **Multiple Datasets**: Support for various sample datasets and CSV upload
- **RESTful API**: Clean endpoints for data retrieval and configuration
- **CORS Support**: Configured for frontend integration

### Sample Datasets
The application includes several realistic sample datasets:
- **Business Metrics**: Comprehensive business performance data (500 rows)
- **Sales Data**: Sales performance by region, product, and time (300 rows)  
- **Employee Metrics**: HR metrics including satisfaction and productivity (200 rows)

## Project Structure

```
DataVisualiser/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── components/
│   │   ├── DataTable.tsx    # AG Grid table component
│   │   ├── ScatterChart.tsx # Recharts visualization
│   │   └── ChartControls.tsx # Chart configuration controls
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   └── App.css              # Application styles
├── .github/
│   └── copilot-instructions.md # Development guidelines
└── start-backend.sh         # Backend startup script
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)

### Installation

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   The Python environment is already configured with all required packages:
   - FastAPI
   - Uvicorn
   - Polars
   - Pydantic
   - And more...

## Available Scripts

### Quick Start
- **`npm run start:all`** - Start both frontend and backend servers simultaneously (recommended for development)

### Individual Scripts
- **`npm run start:frontend`** - Start only the frontend development server (Vite)
- **`npm run start:backend`** - Start only the backend server (FastAPI with Python virtual environment)
- **`npm run dev`** - Alias for start:frontend
- **`npm run build`** - Build the frontend for production
- **`npm run preview`** - Preview the production build
- **`npm run lint`** - Run ESLint on the codebase

### Running the Application

**Option 1: Start Everything at Once (Recommended)**
```bash
npm run start:all
```
This will start both the backend (http://localhost:8000) and frontend (http://localhost:5173) servers simultaneously with colored output for easy debugging.

**Option 2: Start Servers Individually**

1. **Start the Backend Server**
   ```bash
   npm run start:backend
   ```
   Or using the shell script directly:
   ```bash
   ./start-backend.sh
   ```
   The API will be available at `http://localhost:8000`

2. **Start the Frontend Development Server**
   ```bash
   npm run start:frontend
   ```
   The application will be available at `http://localhost:5173`

## API Endpoints

- `GET /` - API health check
- `GET /data/sample` - Get sample data
- `GET /data/table` - Get data formatted for table display
- `POST /data/chart` - Get data formatted for charts with configuration
- `GET /data/columns` - Get available columns and their types
- `POST /data/upload` - Upload new dataset (JSON)
- `POST /data/upload-csv` - Upload CSV file
- `GET /data/sample-datasets` - Get list of available sample datasets
- `POST /data/load-sample/{dataset_name}` - Load a specific sample dataset
- `POST /data/filter` - Apply filters to data

## Usage

1. **Data Management**: 
   - Click "Manage Data" to upload your own CSV files
   - Or load one of the built-in sample datasets (Business Metrics, Sales Data, Employee Metrics)
   
2. **Table View**: View data in a sortable, filterable table format with AG Grid

3. **Chart View**: 
   - Select X and Y axes from available numeric columns
   - Choose optional category column for grouping
   - Configure size and color columns for enhanced visualizations
   - Real-time updates as you modify settings

## Sample Data Files

The `/sample-data` directory contains example CSV files you can use to test the upload functionality:
- `business-metrics.csv` - Company performance data across departments and regions
- `employee-metrics.csv` - HR data with salary, satisfaction, and performance metrics

## Development

### Frontend Technologies
- React 18 with TypeScript
- Vite for fast development and building
- Recharts for data visualization
- AG Grid for advanced table features
- Axios for API communication

### Backend Technologies
- FastAPI for the web framework
- Polars for high-performance data processing
- Pydantic for data validation
- Uvicorn for ASGI server

### Type Safety
The application uses TypeScript throughout with proper type definitions for:
- Data points and chart configurations
- API responses and requests
- Component props and state

## Customization

You can extend the application by:
- Adding new chart types in the ChartControls component
- Implementing additional data processing endpoints
- Adding more visualization options
- Integrating with external data sources

## License

This project is open source and available under the MIT License.
