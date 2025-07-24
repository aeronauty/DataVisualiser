#!/usr/bin/env python3
"""
Quick test script to verify dependencies are installed correctly
"""

def test_imports():
    """Test that all required dependencies can be imported"""
    try:
        print("Testing imports...")
        
        print("  ✓ selenium", end="")
        import selenium
        print(f" ({selenium.__version__})")
        
        print("  ✓ opencv-python", end="")
        import cv2
        print(f" ({cv2.__version__})")
        
        print("  ✓ Pillow", end="")
        from PIL import Image
        print(f" ({Image.__version__})")
        
        print("  ✓ numpy", end="")
        import numpy as np
        print(f" ({np.__version__})")
        
        print("  ✓ imageio", end="")
        import imageio
        print(f" ({imageio.__version__})")
        
        print("\n✅ All dependencies are installed correctly!")
        return True
        
    except ImportError as e:
        print(f"\n❌ Missing dependency: {e}")
        print("\nPlease run: ./setup.sh")
        return False

def test_webdriver():
    """Test WebDriver setup"""
    try:
        print("\nTesting WebDriver setup...")
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        
        # Test headless Chrome
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        print("  Starting headless Chrome...")
        driver = webdriver.Chrome(options=options)
        driver.get("https://www.google.com")
        title = driver.title
        driver.quit()
        
        print(f"  ✓ WebDriver working (loaded: {title})")
        return True
        
    except Exception as e:
        print(f"  ❌ WebDriver error: {e}")
        print("\nYou may need to install ChromeDriver manually:")
        print("  brew install chromedriver  # macOS")
        print("  Or download from: https://chromedriver.chromium.org/")
        return False

if __name__ == "__main__":
    print("🧪 Testing Python Recording Environment\n")
    
    imports_ok = test_imports()
    webdriver_ok = test_webdriver() if imports_ok else False
    
    if imports_ok and webdriver_ok:
        print("\n🎉 Environment is ready for chart recording!")
    else:
        print("\n⚠️  Please fix the issues above before recording.")
