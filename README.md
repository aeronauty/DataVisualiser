# Data Visualizer

A modern data visualization application that enables you to upload CSV files and create interactive charts directly in your browser. Built with React, TypeScript, and Recharts!

## ✨ Features

### 📊 Data Visualization
- **Interactive Scatter Plots**: Create dynamic scatter plots with customizable axes
- **Multi-Column Animation**: Select multiple columns for X or Y axes to create animated transitions
- **Fixed Axis Limits**: Prevent chart jumping during animations with automatically calculated axis limits
- **Category Grouping**: Color-code data points by categorical variables
- **Size Mapping**: Map numeric columns to point sizes for bubble charts
- **Smart Binning**: Automatically bin numeric categories for better visualization

### 📋 Data Management
- **CSV File Upload**: Drag and drop or select CSV files from your computer
- **Sample Datasets**: 4 pre-loaded datasets with realistic business data
- **Automatic Type Detection**: Intelligently detects numeric vs text columns
- **Data Table View**: Browse your data in a sortable, filterable table

### 🎬 Animation & Interaction
- **Smooth Animations**: Configurable animation speed and transition duration
- **Real-time Updates**: Chart updates instantly as you change settings
- **Interactive Tooltips**: Hover over data points to see detailed information
- **Responsive Design**: Works on desktop and mobile devices

### 🔧 Advanced Features
- **Fixed Axis Limits**: When multiple columns are selected, optionally fix axis limits to cover all data ranges
- **Custom Hover Fields**: Select which data fields to display in tooltips
- **Opacity Control**: Adjust point transparency for overlapping data
- **Size Range Control**: Fine-tune bubble size ranges

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Modern web browser

### Installation & Run

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DataVisualiser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   ./start.sh
   ```
   
   Or on Windows:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5174` (or the port shown in terminal)
   - The application will automatically load with sample data

## 📁 Project Structure

```
DataVisualiser/
├── src/
│   ├── components/
│   │   ├── DataTable.tsx         # Data table component
│   │   ├── ScatterChart.tsx      # Interactive scatter plot
│   │   ├── ChartControls.tsx     # Chart configuration panel
│   │   ├── DataManager.tsx       # File upload and dataset management
│   │   ├── MultiSelect.tsx       # Multi-column selection component
│   │   ├── RangeSlider.tsx       # Range input component
│   │   └── PerformanceWarning.tsx # Performance notifications
│   ├── utils/
│   │   ├── csvLoader.ts          # CSV parsing and loading utilities
│   │   ├── dataUtils.ts          # Data transformation utilities
│   │   ├── chartAnimator.ts      # Animation control utilities
│   │   └── axisUtils.ts          # Axis limit calculation utilities
│   ├── types/
│   │   └── gif.d.ts              # Type definitions for GIF handling
│   ├── types.ts                  # Main TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   ├── App.css                   # Application styles
│   └── main.tsx                  # Application entry point
├── public/
│   ├── sample-data/              # Pre-loaded CSV datasets
│   │   ├── comprehensive-business-data.csv
│   │   ├── business-metrics.csv
│   │   └── employee-metrics.csv
│   └── test_data.csv
├── start.sh                      # Quick startup script
└── test-puppeteer.js            # Automated testing script
```

## 📊 Sample Datasets

The application includes 4 sample datasets to get you started:

### 1. Comprehensive Business Data (60+ rows)
- **Columns**: 26 fields including revenue, profit, employees, customers, satisfaction scores
- **Use Case**: Multi-dimensional business analysis with financial and operational metrics
- **Animation**: Great for showing revenue vs profit across different time periods

### 2. Business Metrics (25 rows)
- **Columns**: Company, department, region, revenue, profit, employees by quarter
- **Use Case**: Departmental performance comparison across regions
- **Animation**: Compare different quarters or departments

### 3. Employee Metrics (21 rows)
- **Columns**: Employee data with satisfaction, productivity, salary, performance ratings
- **Use Case**: HR analytics and employee performance visualization
- **Animation**: Explore relationships between satisfaction, productivity, and tenure

### 4. Test Data (11 rows)
- **Columns**: Simple employee dataset with name, age, salary, department
- **Use Case**: Quick testing and learning the interface
- **Animation**: Basic salary vs age analysis

## 🎮 How to Use

### 1. Loading Data
- **Upload CSV**: Click "Manage Data" → "Upload CSV File" → Select your file
- **Sample Data**: Click "Manage Data" → Choose from 4 pre-loaded datasets
- **Format**: CSV files with headers in the first row

### 2. Table View
- Browse your data in a structured table
- Sort columns by clicking headers
- View all data fields and types

### 3. Chart View
- **Basic Setup**:
  - Select X and Y axes from numeric columns
  - Choose optional category column for color grouping
  - Set size column for bubble charts

- **Multi-Column Animation**:
  - Select multiple columns for X or Y axes
  - Enable "Enable Animation" checkbox
  - Adjust animation speed (0.5-10 seconds per frame)
  - Configure transition duration (200-2000ms)

- **Fixed Axis Limits**:
  - When multiple columns are selected, enable "Fix Axis Limits"
  - Prevents chart from jumping during animations
  - Automatically calculates limits to cover all data ranges
  - Shows current axis ranges in the control panel

### 4. Advanced Configuration
- **Hover Fields**: Select which data fields appear in tooltips
- **Opacity**: Adjust point transparency (10-100%)
- **Size Range**: Control bubble size limits (1-50 pixels)
- **Category Bins**: For numeric categories, set number of bins (2-20)

## 🛠️ Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build
- **`npm run lint`** - Run ESLint
- **`./start.sh`** - Quick start (macOS/Linux)

## 🧪 Testing

Run automated tests with Puppeteer:

```bash
npm install puppeteer --save-dev
node test-puppeteer.js
```

This will:
- Launch the application in a browser
- Test data loading functionality
- Verify chart rendering
- Test data manager functionality
- Take screenshots for verification

## 🔧 Technical Details

### Frontend Technologies
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Recharts** for interactive data visualization
- **CSS3** for modern styling and animations

### Data Processing
- **Client-side CSV parsing** with automatic type detection
- **Polars-inspired data transformations** in TypeScript
- **Smart binning** for categorical data
- **Real-time data filtering** and transformation

### Performance Features
- **Lazy loading** of large datasets
- **Memoized components** to prevent unnecessary re-renders
- **Efficient data structures** for smooth animations
- **Performance warnings** for large datasets

## 🎨 Customization

### Adding New Chart Types
Extend the `ChartConfig` interface in `src/types.ts` and add new options in `ChartControls.tsx`.

### Custom Data Sources
Modify `src/utils/csvLoader.ts` to add support for other data formats (JSON, XML, APIs).

### Styling
Update `src/App.css` or add CSS modules for component-specific styling.

### Animation Presets
Add animation presets in `src/utils/chartAnimator.ts` for common visualization patterns.

## 🚀 Deployment

### Static Hosting
Build and deploy to any static hosting service:

```bash
npm run build
# Deploy the 'dist' folder to Netlify, Vercel, GitHub Pages, etc.
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5174
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 CSV File Format

Your CSV files should follow this format:

```csv
column1,column2,column3,category_column
123.45,67.89,text_value,Category A
234.56,78.90,another_value,Category B
```

**Requirements**:
- First row must contain column headers
- Numeric columns will be auto-detected for chart axes
- Text columns can be used for categories
- No special characters in column names (use underscores instead of spaces)

## 🐛 Troubleshooting

### Common Issues

**CSV not loading**:
- Check that the first row contains headers
- Ensure the file is properly formatted CSV
- Try with a smaller file first

**Chart not displaying**:
- Verify you have numeric columns selected for X and Y axes
- Check browser console for error messages
- Ensure data contains valid numeric values

**Animation not working**:
- Select multiple columns for X or Y axes
- Enable the "Enable Animation" checkbox
- Check that selected columns contain numeric data

**Performance issues**:
- Use datasets under 1000 rows for best performance
- Enable fixed axis limits to reduce calculation overhead
- Reduce animation speed for smoother transitions

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using React, TypeScript, and Recharts**