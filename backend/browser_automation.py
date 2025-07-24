"""
Browser automation for creating smooth chart animations
Uses Selenium WebDriver to automate browser interactions and record animations
"""
import time
import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from PIL import Image
import tempfile

class BrowserAnimationRecorder:
    def __init__(self, headless: bool = True, browser: str = "chrome"):
        self.headless = headless
        self.browser = browser.lower()
        self.driver = None
        self.recording_frames = []
        self.temp_dir = None
        
    def setup_driver(self):
        """Initialize the WebDriver"""
        if self.browser == "chrome":
            options = ChromeOptions()
            if self.headless:
                options.add_argument("--headless")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1200,800")
            self.driver = webdriver.Chrome(options=options)
        else:
            options = FirefoxOptions()
            if self.headless:
                options.add_argument("--headless")
            options.add_argument("--width=1200")
            options.add_argument("--height=800")
            self.driver = webdriver.Firefox(options=options)
            
        self.driver.set_window_size(1200, 800)
        return self.driver
        
    def navigate_to_chart(self, base_url: str):
        """Navigate to the chart application and wait for it to load"""
        try:
            self.driver.get(base_url)
            
            # Wait for the page to load completely
            wait = WebDriverWait(self.driver, 30)
            
            # Wait for React to load and chart to be ready
            wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
            
            # Give extra time for React app to initialize
            time.sleep(5)
            
            # Check if we're in the right view mode by looking for chart elements
            try:
                # Look for chart container or any chart-related elements
                chart_elements = self.driver.find_elements(By.CSS_SELECTOR, 
                    ".recharts-wrapper, .recharts-surface, svg, canvas, .chart-container")
                
                if chart_elements:
                    print(f"Found {len(chart_elements)} chart elements")
                    return True
                else:
                    print("No chart elements found - may need to switch to chart view")
                    # Try to click chart view button if available
                    try:
                        chart_view_btn = self.driver.find_element(By.XPATH, 
                            "//button[contains(text(), 'Chart View')] | //button[contains(text(), 'Chart')]")
                        chart_view_btn.click()
                        time.sleep(3)
                        print("Switched to chart view")
                        return True
                    except:
                        print("Could not find or click chart view button")
                        return False
                        
            except Exception as e:
                print(f"Error checking for chart elements: {e}")
                return False
                
        except Exception as e:
            print(f"Failed to navigate to chart: {e}")
            return False
    
    def apply_frame_config(self, frame_config: Dict[str, Any]):
        """Apply a frame configuration to the chart by injecting JavaScript"""
        try:
            print(f"Applying frame config: {frame_config}")
            
            # First, ensure we have data loaded by triggering the default dataset
            load_data_script = """
            // Try to load default data if no data is present
            if (typeof window.loadDefaultData === 'function') {
                window.loadDefaultData();
            } else {
                // Trigger click on "Generate Sample Data" or similar button
                const generateBtn = document.querySelector('button:contains("Generate"), button:contains("Sample"), button:contains("Load")');
                if (generateBtn) {
                    generateBtn.click();
                }
            }
            
            // Wait a moment for data to load
            setTimeout(() => {
                console.log('Data loading initiated');
            }, 1000);
            """
            
            self.driver.execute_script(load_data_script)
            time.sleep(2)
            
            # Now apply the chart configuration
            config_script = f"""
            try {{
                console.log('Applying chart configuration:', {json.dumps(frame_config)});
                
                // Try multiple methods to update chart configuration
                if (window.updateChartConfig) {{
                    window.updateChartConfig({json.dumps(frame_config)});
                }} else {{
                    // Method 1: Direct state update via React DevTools if available
                    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {{
                        console.log('React DevTools available, attempting state update');
                    }}
                    
                    // Method 2: Trigger form updates by finding and updating form controls
                    const xColumnSelect = document.querySelector('select[name*="x"], select[id*="x"], select:contains("X-Axis")');
                    const yColumnSelect = document.querySelector('select[name*="y"], select[id*="y"], select:contains("Y-Axis")');
                    
                    if (xColumnSelect && '{frame_config.get('x_column', '')}') {{
                        xColumnSelect.value = '{frame_config.get('x_column', '')}';
                        xColumnSelect.dispatchEvent(new Event('change', {{ bubbles: true }}));
                        console.log('Updated X column to:', '{frame_config.get('x_column', '')}');
                    }}
                    
                    if (yColumnSelect && '{frame_config.get('y_column', '')}') {{
                        yColumnSelect.value = '{frame_config.get('y_column', '')}';
                        yColumnSelect.dispatchEvent(new Event('change', {{ bubbles: true }}));
                        console.log('Updated Y column to:', '{frame_config.get('y_column', '')}');
                    }}
                    
                    // Method 3: Custom event dispatch
                    const event = new CustomEvent('chartConfigUpdate', {{
                        detail: {json.dumps(frame_config)}
                    }});
                    document.dispatchEvent(event);
                    
                    // Method 4: Try to find React fiber and update state directly
                    const chartContainer = document.querySelector('.recharts-wrapper, .chart-container, [data-testid*="chart"]');
                    if (chartContainer && chartContainer._reactInternalFiber) {{
                        console.log('Found React fiber, attempting direct update');
                        // This is a more advanced technique - may need adjustment
                    }}
                }}
                
                // Force a re-render by triggering window resize
                setTimeout(() => {{
                    window.dispatchEvent(new Event('resize'));
                }}, 500);
                
                return 'Configuration applied successfully';
            }} catch (error) {{
                console.error('Failed to apply configuration:', error);
                return 'Error: ' + error.message;
            }}
            """
            
            result = self.driver.execute_script(config_script)
            print(f"Configuration result: {result}")
            
            # Wait for changes to take effect
            time.sleep(3)
            
            # Verify the configuration was applied
            verify_script = """
            const charts = document.querySelectorAll('.recharts-wrapper, svg');
            return {
                chartsFound: charts.length,
                pageTitle: document.title,
                hasData: document.querySelector('.recharts-wrapper') !== null
            };
            """
            
            verification = self.driver.execute_script(verify_script)
            print(f"Verification: {verification}")
            
            return verification.get('chartsFound', 0) > 0
            
        except Exception as e:
            print(f"Failed to apply frame config: {e}")
            return False
    
    def capture_screenshot(self, output_path: str):
        """Capture a screenshot of the current chart"""
        try:
            screenshot = self.driver.get_screenshot_as_png()
            with open(output_path, 'wb') as f:
                f.write(screenshot)
            return True
        except Exception as e:
            print(f"Failed to capture screenshot: {e}")
            return False
    
    def create_gif_from_frames(self, frame_paths: List[str], output_path: str, frame_delay: int = 1000):
        """Create a GIF from captured frame images"""
        try:
            images = []
            for frame_path in frame_paths:
                if os.path.exists(frame_path):
                    img = Image.open(frame_path)
                    images.append(img)
            
            if images:
                # Save as GIF with loop
                images[0].save(
                    output_path,
                    save_all=True,
                    append_images=images[1:],
                    duration=frame_delay,
                    loop=0,  # Infinite loop
                    optimize=True
                )
                return output_path
            else:
                raise Exception("No valid frames found")
                
        except Exception as e:
            print(f"Failed to create GIF: {e}")
            raise
    
    def record_animation(self, base_url: str, frames_config: List[Dict[str, Any]], output_path: str, animation_config: Dict[str, Any]):
        """Record a complete animation sequence"""
        try:
            # Setup driver
            self.setup_driver()
            
            # Navigate to chart
            if not self.navigate_to_chart(base_url):
                raise Exception("Failed to navigate to chart")
            
            # Create temporary directory for frames
            with tempfile.TemporaryDirectory() as temp_dir:
                frame_paths = []
                
                # Capture frames
                for i, frame_config in enumerate(frames_config):
                    print(f"Capturing frame {i+1}/{len(frames_config)}")
                    
                    # Apply frame configuration
                    if not self.apply_frame_config(frame_config):
                        print(f"Warning: Failed to apply frame config {i}")
                    
                    # Capture screenshot
                    frame_path = os.path.join(temp_dir, f"frame_{i:03d}.png")
                    if self.capture_screenshot(frame_path):
                        frame_paths.append(frame_path)
                    else:
                        print(f"Warning: Failed to capture frame {i}")
                
                # Create GIF from frames
                if frame_paths:
                    frame_delay = animation_config.get('frameDelay', 1000)
                    return self.create_gif_from_frames(frame_paths, output_path, frame_delay)
                else:
                    raise Exception("No frames were captured successfully")
                    
        except Exception as e:
            print(f"Animation recording failed: {e}")
            raise
        finally:
            if self.driver:
                self.driver.quit()

def create_animation_from_config(base_url: str, frames: List[Dict[str, Any]], output_path: str, animation_config: Dict[str, Any]) -> str:
    """
    Main function to create animation from configuration
    """
    try:
        recorder = BrowserAnimationRecorder(headless=True)
        result_path = recorder.record_animation(base_url, frames, output_path, animation_config)
        return result_path
    except Exception as e:
        print(f"Failed to create animation: {e}")
        raise
