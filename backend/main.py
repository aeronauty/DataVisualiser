from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import polars as pl
import json
import uvicorn
from datetime import datetime
import random
import io

app = FastAPI(title="Data Visualizer API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Data models
class DataPoint(BaseModel):
    x: float
    y: float
    category: Optional[str] = None
    size: Optional[float] = None
    color: Optional[str] = None

class ChartConfig(BaseModel):
    chart_type: str  # 'scatter', 'line', 'bar'
    x_column: str
    y_column: str
    category_column: Optional[str] = None
    size_column: Optional[str] = None
    color_column: Optional[str] = None

# Sample data generation
def generate_sample_data(num_points: int = 500) -> pl.LazyFrame:
    """Generate comprehensive sample data simulating real-world scenarios"""
    data = []
    
    # Categories for different data scenarios
    companies = ["TechCorp", "DataInc", "CloudSys", "AILabs", "DevOps", "SecureNet", "WebFlow", "AppForge"]
    departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Support", "Research"]
    regions = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa"]
    product_categories = ["Software", "Hardware", "Services", "Consulting", "Support", "Training"]
    
    # Generate realistic business data
    for i in range(num_points):
        # Base metrics with some correlation
        revenue = random.uniform(10000, 1000000)
        profit_margin = random.uniform(0.05, 0.30)
        profit = revenue * profit_margin
        
        # Employee and performance metrics
        employees = random.randint(10, 1000)
        productivity = random.uniform(50, 150) + (employees / 20)  # Slightly correlated with team size
        
        # Time-based data
        quarter = random.choice([1, 2, 3, 4])
        year = random.choice([2023, 2024, 2025])
        
        # Customer metrics
        customers = random.randint(100, 10000)
        satisfaction = random.uniform(1, 10)
        retention_rate = random.uniform(0.60, 0.95)
        
        # Market data
        market_share = random.uniform(0.01, 0.25)
        growth_rate = random.uniform(-0.10, 0.50)
        
        data.append({
            "id": i,
            "company": random.choice(companies),
            "department": random.choice(departments),
            "region": random.choice(regions),
            "product_category": random.choice(product_categories),
            
            # Financial metrics
            "revenue": round(revenue, 2),
            "profit": round(profit, 2),
            "profit_margin": round(profit_margin * 100, 2),  # As percentage
            
            # Operational metrics
            "employees": employees,
            "productivity_score": round(productivity, 1),
            "customers": customers,
            "customer_satisfaction": round(satisfaction, 1),
            "retention_rate": round(retention_rate * 100, 1),  # As percentage
            
            # Market metrics
            "market_share": round(market_share * 100, 2),  # As percentage
            "growth_rate": round(growth_rate * 100, 1),    # As percentage
            
            # Time dimensions
            "year": year,
            "quarter": quarter,
            "quarter_year": f"Q{quarter} {year}",
            
            # Additional dimensions for visualization
            "size_metric": round(revenue / 1000, 1),  # Revenue in thousands for bubble size
            "efficiency": round((profit / employees) if employees > 0 else 0, 2),
            "revenue_per_customer": round((revenue / customers) if customers > 0 else 0, 2),
            
            # Categorical data for grouping
            "performance_tier": "High" if profit_margin > 0.20 else "Medium" if profit_margin > 0.10 else "Low",
            "company_size": "Large" if employees > 500 else "Medium" if employees > 100 else "Small",
            "region_category": "Developed" if random.choice([True, False]) else "Emerging",
            
            # Additional numeric fields for variety
            "marketing_spend": round(revenue * random.uniform(0.05, 0.15), 2),
            "rd_spend": round(revenue * random.uniform(0.02, 0.12), 2),
            "employee_satisfaction": round(random.uniform(6, 10), 1),
            "innovation_index": round(random.uniform(1, 100), 1),
            
            # Timestamp
            "last_updated": datetime.now().isoformat(),
        })
    
    return pl.LazyFrame(data)

# In-memory data storage (replace with actual data source)
current_data = generate_sample_data()

@app.get("/")
async def root():
    return {"message": "Data Visualizer API is running"}

@app.get("/data/sample")
async def get_sample_data():
    """Get sample data for visualization"""
    df = current_data.collect()
    return {"data": df.to_dicts()}

@app.get("/data/table")
async def get_table_data(limit: Optional[int] = None):
    """Get data in table format for AG Grid"""
    df = current_data
    
    if limit:
        df = df.limit(limit)
    
    result = df.collect()
    return {
        "data": result.to_dicts(),
        "columns": list(result.columns),
        "total_rows": len(result)
    }

@app.post("/data/chart")
async def get_chart_data(config: ChartConfig):
    """Get data formatted for charts based on configuration"""
    try:
        df = current_data
        
        # Select required columns
        required_columns = [config.x_column, config.y_column]
        if config.category_column:
            required_columns.append(config.category_column)
        if config.size_column:
            required_columns.append(config.size_column)
        if config.color_column:
            required_columns.append(config.color_column)
        
        # Check if columns exist
        sample_df = df.limit(1).collect()
        available_columns = list(sample_df.schema.keys())
        missing_columns = [col for col in required_columns if col not in available_columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing columns: {missing_columns}"
            )
        
        # Select and collect data
        result_df = df.select(required_columns).collect()
        
        # Format for frontend
        chart_data = []
        for row in result_df.to_dicts():
            point = {
                "x": row[config.x_column],
                "y": row[config.y_column],
            }
            
            if config.category_column:
                point["category"] = row[config.category_column]
            if config.size_column:
                point["size"] = row[config.size_column]
            if config.color_column:
                point["color"] = row[config.color_column]
                
            chart_data.append(point)
        
        return {
            "data": chart_data,
            "config": config.dict(),
            "total_points": len(chart_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/data/columns")
async def get_available_columns():
    """Get available columns for chart configuration"""
    try:
        # Collect the schema from the LazyFrame
        df_sample = current_data.limit(1).collect()  # Get a small sample to infer schema
        schema = df_sample.schema
        columns_info = []
        
        for name, dtype in schema.items():
            columns_info.append({
                "name": name,
                "type": str(dtype),
                "is_numeric": dtype in [pl.Float64, pl.Float32, pl.Int64, pl.Int32, pl.Int16, pl.Int8]
            })
        
        return {"columns": columns_info}
    except Exception as e:
        print(f"Error getting columns: {e}")
        return {"columns": []}

@app.post("/data/upload")
async def upload_data(data: List[Dict[str, Any]]):
    """Upload new data (replace existing data)"""
    global current_data
    try:
        # Convert to Polars LazyFrame
        current_data = pl.LazyFrame(data)
        
        # Validate data
        row_count = len(data)
        col_count = len(data[0]) if data else 0
        
        return {
            "message": "Data uploaded successfully",
            "rows": row_count,
            "columns": col_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing data: {str(e)}")

@app.post("/data/upload-csv")
async def upload_csv_file(file: UploadFile = File(...)):
    """Upload a CSV file and replace current data"""
    global current_data
    try:
        # Read file content
        content = await file.read()
        
        # Convert bytes to string
        csv_string = content.decode('utf-8')
        
        # Create StringIO object for polars
        csv_io = io.StringIO(csv_string)
        
        # Read CSV with Polars
        df = pl.read_csv(csv_io)
        current_data = df.lazy()
        
        # Get basic info
        schema = current_data.collect_schema()
        row_count = len(df)
        col_count = len(schema)
        
        return {
            "message": f"CSV file '{file.filename}' uploaded successfully",
            "rows": row_count,
            "columns": col_count,
            "column_names": list(schema.keys())
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV file: {str(e)}")

@app.get("/data/sample-datasets")
async def get_sample_datasets():
    """Get list of available sample datasets"""
    datasets = [
        {
            "name": "business_metrics",
            "description": "Comprehensive business performance data with financial, operational, and market metrics",
            "size": 500,
            "columns": ["revenue", "profit", "employees", "customers", "satisfaction", "market_share", "growth_rate"]
        },
        {
            "name": "sales_data", 
            "description": "Sales performance data by region, product, and time period",
            "size": 300,
            "columns": ["sales_amount", "units_sold", "region", "product", "quarter", "year"]
        },
        {
            "name": "employee_metrics",
            "description": "HR metrics including satisfaction, productivity, and retention data",
            "size": 200,
            "columns": ["employee_id", "department", "satisfaction", "productivity", "salary", "tenure"]
        }
    ]
    return {"datasets": datasets}

@app.post("/data/load-sample/{dataset_name}")
async def load_sample_dataset(dataset_name: str):
    """Load a specific sample dataset"""
    global current_data
    
    try:
        if dataset_name == "business_metrics":
            current_data = generate_sample_data(500)
        elif dataset_name == "sales_data":
            current_data = generate_sales_data(300)
        elif dataset_name == "employee_metrics":
            current_data = generate_employee_data(200)
        else:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        # Get info about loaded dataset
        sample_data = current_data.limit(1).collect()
        schema = sample_data.schema
        
        return {
            "message": f"Sample dataset '{dataset_name}' loaded successfully",
            "rows": 500 if dataset_name == "business_metrics" else 300 if dataset_name == "sales_data" else 200,
            "columns": len(schema),
            "column_names": list(schema.keys()),
            "sample_row": sample_data.to_dicts()[0] if len(sample_data) > 0 else {}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(e)}")

def generate_sales_data(num_points: int = 300) -> pl.LazyFrame:
    """Generate sales performance data"""
    data = []
    regions = ["North", "South", "East", "West", "Central"]
    products = ["Product A", "Product B", "Product C", "Product D", "Product E"]
    
    for i in range(num_points):
        base_sales = random.uniform(10000, 100000)
        units = random.randint(100, 1000)
        
        data.append({
            "id": i,
            "sales_amount": round(base_sales, 2),
            "units_sold": units,
            "price_per_unit": round(base_sales / units, 2),
            "region": random.choice(regions),
            "product": random.choice(products),
            "quarter": random.choice([1, 2, 3, 4]),
            "year": random.choice([2023, 2024, 2025]),
            "salesperson": f"Rep_{random.randint(1, 50)}",
            "commission": round(base_sales * random.uniform(0.05, 0.15), 2),
            "customer_type": random.choice(["Enterprise", "SMB", "Individual"]),
            "sales_channel": random.choice(["Direct", "Partner", "Online"]),
            "discount_rate": round(random.uniform(0, 0.20), 3),
            "profit_margin": round(random.uniform(0.10, 0.40), 3)
        })
    
    return pl.LazyFrame(data)

def generate_employee_data(num_points: int = 200) -> pl.LazyFrame:
    """Generate employee HR metrics data"""
    data = []
    departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"]
    positions = ["Junior", "Mid-level", "Senior", "Lead", "Manager", "Director"]
    
    for i in range(num_points):
        tenure_years = random.uniform(0.5, 15)
        base_salary = random.uniform(40000, 200000)
        
        data.append({
            "employee_id": f"EMP_{i:04d}",
            "department": random.choice(departments),
            "position": random.choice(positions),
            "satisfaction_score": round(random.uniform(1, 10), 1),
            "productivity_score": round(random.uniform(60, 100), 1),
            "salary": round(base_salary, 2),
            "tenure_years": round(tenure_years, 1),
            "age": random.randint(22, 65),
            "training_hours": random.randint(0, 100),
            "performance_rating": round(random.uniform(2.0, 5.0), 1),
            "bonus_percentage": round(random.uniform(0, 0.25), 3),
            "remote_work_days": random.randint(0, 5),
            "overtime_hours": random.randint(0, 20),
            "certifications": random.randint(0, 8),
            "promotion_eligible": random.choice([True, False])
        })
    
    return pl.LazyFrame(data)

@app.post("/data/filter")
async def filter_data(filters: Dict[str, Any]):
    """Apply filters to the data"""
    try:
        df = current_data
        
        # Apply filters (basic implementation)
        for column, filter_value in filters.items():
            if isinstance(filter_value, dict):
                if "min" in filter_value:
                    df = df.filter(pl.col(column) >= filter_value["min"])
                if "max" in filter_value:
                    df = df.filter(pl.col(column) <= filter_value["max"])
            else:
                df = df.filter(pl.col(column) == filter_value)
        
        result = df.collect()
        return {
            "data": result.to_dicts(),
            "total_rows": len(result)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error applying filters: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
