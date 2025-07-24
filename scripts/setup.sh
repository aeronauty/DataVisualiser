#!/bin/bash

# Install Python dependencies for chart animation recording
echo "Installing Python dependencies for chart animation recording..."

cd "$(dirname "$0")"

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo "Installing required packages..."
pip install -r requirements.txt

# Install ChromeDriver automatically
echo "Installing ChromeDriver..."
pip install webdriver-manager

echo "✅ Setup complete!"
echo "Python recording environment is ready."
echo ""
echo "To test the recording script:"
echo "  source venv/bin/activate"
echo "  python record_chart_animation.py --help"
