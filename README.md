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
├── start.sh                 # Quick startup script (starts both servers)
└── start-backend.sh         # Backend-only startup script
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher) **[Updated: Now requires Python 3.9+ for latest NumPy 2.1+]**

### Quick Installation & Run

**The fastest way to get started:**

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd DataVisualiser
   ```

2. **Install dependencies and start everything**
   
   **On macOS/Linux:**
   ```bash
   npm install
   ./start.sh
   ```
   
   **On Windows:**
   ```bash
   npm install
   npm run start:all
   ```

**What this does automatically:**
- Install Python backend dependencies (via virtual environment on macOS/Linux)
- Uses latest package versions including NumPy 2.1+, Polars 1.12+, FastAPI 0.115+
- Start the FastAPI backend server on http://localhost:8000
- Start the React frontend development server on http://localhost:5174
- Handle graceful shutdown when you press Ctrl+C

### Enterprise/Work Environment Notes

If you're installing at work and encountering issues:

1. **Corporate Firewall/Proxy**: You may need to configure pip to work with your corporate proxy:
   ```bash
   pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r backend/requirements.txt
   ```

2. **Package Version Conflicts**: The requirements.txt now uses latest versions. If you need older versions for compatibility:
   ```bash
   cd backend
   pip install -r requirements.txt --force-reinstall
   ```

3. **Python Version**: Ensure you have Python 3.9+ for NumPy 2.1+ compatibility

### Manual Installation

If you prefer to install dependencies manually:

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Set up Python Virtual Environment and Install Backend Dependencies**
   
   **On macOS/Linux:**
   ```bash
   # Create a virtual environment
   python -m venv .venv
   
   # Activate the virtual environment
   source .venv/bin/activate
   
   # Install backend dependencies
   cd backend
   pip install -r requirements.txt
   cd ..
   ```
   
   **On Windows (Command Prompt):**
   ```cmd
   # Create a virtual environment
   python -m venv .venv
   
   # Activate the virtual environment
   .venv\Scripts\activate
   
   # Install backend dependencies
   cd backend
   pip install -r requirements.txt
   cd ..
   ```
   
   **On Windows (PowerShell):**
   ```powershell
   # Create a virtual environment
   python -m venv .venv
   
   # Activate the virtual environment
   .venv\Scripts\Activate.ps1
   
   # Install backend dependencies
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

   **Note:** The virtual environment needs to be activated each time you want to run the backend server manually. The startup scripts handle this automatically on macOS/Linux.

## Running the Application

### Option 1: Quick Start Script (Recommended)

**On macOS/Linux:**
```bash
./start.sh
```

**On Windows:**
```bash
npm run start:all
```

This single command starts both servers and handles everything for you. Press `Ctrl+C` to stop both servers cleanly.

### Option 2: Using NPM Scripts (Cross-platform)
- **`npm run start:all`** - Start both frontend and backend servers simultaneously
- **`npm run start:frontend`** - Start only the frontend development server (Vite)
- **`npm run start:backend`** - Start only the backend server (FastAPI)

### Option 3: Manual Server Startup

1. **Start the Backend Server**
   
   **On macOS/Linux:**
   ```bash
   # Activate virtual environment first
   source .venv/bin/activate
   
   # Start the server
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **On Windows (Command Prompt):**
   ```cmd
   # Activate virtual environment first
   .venv\Scripts\activate
   
   # Start the server
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **On Windows (PowerShell):**
   ```powershell
   # Activate virtual environment first
   .venv\Scripts\Activate.ps1
   
   # Start the server
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend Development Server** (in another terminal)
   ```bash
   npm run dev
   ```

## Available Scripts

### Quick Start
- **`npm run start:all`** - **[RECOMMENDED for Windows]** Start both frontend and backend servers simultaneously
- **`./start.sh`** - **[RECOMMENDED for macOS/Linux]** Start both servers with shell script

### Development Scripts
- **`npm run dev`** - Start only the frontend development server (Vite)
- **`npm run build`** - Build the frontend for production
- **`npm run preview`** - Preview the production build
- **`npm run lint`** - Run ESLint on the codebase
- **`npm run start:frontend`** - Start only the frontend development server
- **`npm run start:backend`** - Start only the backend server (FastAPI)

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
- **FastAPI 0.115+** for the web framework
- **Polars 1.12+** for high-performance data processing
- **NumPy 2.1+** for numerical computing
- **Pandas 2.2+** for data manipulation compatibility
- **Pydantic 2.10+** for data validation
- **Uvicorn 0.32+** for ASGI server

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
