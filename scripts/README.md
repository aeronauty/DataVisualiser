# Python Chart Animation Recording

This directory contains a Python-based solution for recording chart animations without browser performance issues.

## 🎯 Why Python Recording?

- **No Browser Freezing**: Runs independently from the browser
- **High Quality**: Captures smooth animations at consistent frame rates
- **Resource Efficient**: Uses dedicated tools optimized for screen recording
- **Reliable**: More stable than JavaScript-based recording methods

## 🚀 Quick Setup

1. **Install Dependencies**:
   ```bash
   cd scripts
   ./setup.sh
   ```

2. **Test Installation**:
   ```bash
   cd scripts
   source venv/bin/activate
   python test_environment.py
   ```

3. **Manual Test** (optional):
   ```bash
   # Make sure your frontend is running on localhost:5174
   python record_chart_animation.py --url http://localhost:5174 --duration 10 --format gif
   ```

## 📋 Requirements

- Python 3.8+
- Google Chrome browser
- ChromeDriver (automatically installed via webdriver-manager)

## 🔧 How It Works

1. **Browser Automation**: Uses Selenium to control a Chrome browser instance
2. **Element Targeting**: Locates the chart container on the page
3. **Frame Capture**: Screenshots the chart at high frame rates (30+ FPS)
4. **Format Conversion**: Saves as GIF, MP4, or other formats

## 🎮 Usage from Frontend

1. Select "Python Recording" option in the export panel
2. Click "Export Animation"
3. The frontend calls the backend API
4. Backend executes the Python script
5. Generated file is automatically downloaded

## ⚙️ Configuration Options

- **Duration**: Recording length in seconds
- **FPS**: Frame rate (recommended: 30)
- **Format**: gif, mp4, or both
- **Quality**: Adjustable via script parameters

## 🐛 Troubleshooting

### ChromeDriver Issues
```bash
# Manual ChromeDriver installation (if needed)
brew install chromedriver  # macOS
# or download from https://chromedriver.chromium.org/
```

### Permission Issues
```bash
chmod +x setup.sh
```

### Dependencies Missing
```bash
# Reinstall dependencies
rm -rf venv
./setup.sh
```

## 📁 Files

- `record_chart_animation.py` - Main recording script
- `setup.sh` - Automated setup script
- `test_environment.py` - Dependency verification
- `requirements.txt` - Python package list

## 🎨 Example Output

The script generates high-quality animations showing smooth transitions between chart states, perfect for presentations or documentation.
