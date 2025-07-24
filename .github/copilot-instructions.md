<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Data Visualizer Project

This is a full-stack data visualization application with the following components:

## Frontend (React + TypeScript + Vite)
- **React**: Modern UI framework with TypeScript for type safety
- **Recharts**: For interactive data visualizations (scatter plots, line charts, bar charts)
- **AG Grid**: For advanced data table display with sorting, filtering, and pagination
- **Axios**: For API communication with the backend

## Backend (Python + FastAPI)
- **FastAPI**: Modern, fast web framework for building APIs
- **Polars**: High-performance DataFrame library with LazyFrame support for efficient data processing
- **Pydantic**: Data validation and serialization using Python type annotations
- **Uvicorn**: ASGI server for running the FastAPI application

## Key Features
- **Dual View Mode**: Switch between table view (AG Grid) and chart view (Recharts)
- **Customizable Charts**: Configure scatter plots with different X/Y axes, categories, sizes, and colors
- **Real-time Configuration**: Chart controls update visualizations in real-time
- **Data Processing**: Backend uses Polars LazyFrames for efficient data manipulation
- **Type Safety**: Full TypeScript support on frontend with proper type definitions

## Development Guidelines
- Use TypeScript interfaces for all data structures
- Leverage Polars LazyFrames for data processing operations
- Maintain separation between frontend components and backend data logic
- Follow React best practices with functional components and hooks
- Use proper error handling and loading states

## API Endpoints
- `GET /data/table`: Retrieve data for table display
- `POST /data/chart`: Get formatted data for chart visualization
- `GET /data/columns`: Get available columns and their types
- `POST /data/upload`: Upload new dataset
- `POST /data/filter`: Apply filters to data

When working on this project, consider data visualization best practices and ensure both table and chart views provide meaningful insights into the data.
