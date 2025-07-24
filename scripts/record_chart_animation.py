#!/usr/bin/env python3
"""
Chart Animation Recorder
Creates smooth interpolated animations by calculating intermediate positions between data points.
"""

import argparse
import time
import json
import sys
import logging
from pathlib import Path
from urllib.parse import urljoin
import cv2
import numpy as np
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from PIL import Image, ImageDraw, ImageFont
import imageio
import math

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('recording.log')
    ]
)
logger = logging.getLogger(__name__)


class ChartAnimationRecorder:
    def __init__(self, base_url="http://localhost:5174", headless=False):
        self.base_url = base_url
        self.headless = headless
        self.driver = None
        self.frames = []
        
    def setup_driver(self):
        """Setup Chrome WebDriver with optimal settings for recording"""
        logger.info("Setting up Chrome WebDriver...")
        
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
            logger.info("Running in headless mode")
        
        # Optimize for recording
        chrome_options.add_argument("--window-size=1200,800")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-plugins")
        
        # Disable unnecessary features
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        try:
            logger.info("Initializing Chrome driver...")
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            logger.info("Chrome driver initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Chrome driver: {e}")
            raise
        
    def wait_for_chart_load(self):
        """Wait for chart to load completely"""
        self.logger.info("Waiting for chart to load...")
        
        # Wait for recharts-wrapper
        self.logger.info("Looking for recharts-wrapper...")
        chart_element = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".recharts-wrapper"))
        )
        self.logger.info("Found recharts-wrapper")
        
        # Check for export-animation controls (optional)
        self.logger.info("Checking for export-animation controls...")
        try:
            export_controls = WebDriverWait(self.driver, 2).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".export-animation"))
            )
            self.logger.info("Found export-animation controls")
        except Exception as e:
            self.logger.info("Export controls not found - continuing anyway")
            self.logger.debug(f"Export controls error: {e}")
        
        # Additional wait for chart to be fully rendered
        time.sleep(2)
        self.logger.info("Chart should be fully loaded now")
    
    def setup_animation(self, x_columns, y_columns, animation_speed=2):
        """Configure the chart for animation"""
        try:
            # Enable animation mode
            enable_animation_script = """
            const event = new CustomEvent('enableAnimation', {
                detail: {
                    x_columns: arguments[0],
                    y_columns: arguments[1],
                    animation_speed: arguments[2],
                    animation_enabled: true
                }
            });
            window.dispatchEvent(event);
            """
            
            self.driver.execute_script(
                enable_animation_script, 
                x_columns, 
                y_columns, 
                animation_speed
            )
            
            time.sleep(1)  # Allow configuration to apply
            return True
            
        except Exception as e:
            print(f"Error setting up animation: {e}")
            return False
    
    def get_chart_element(self):
        """Get the chart container element"""
        logger.info("Looking for chart element...")
        try:
            element = self.driver.find_element(By.CLASS_NAME, "recharts-wrapper")
            logger.info("Found recharts-wrapper element")
            return element
        except:
            try:
                element = self.driver.find_element(By.CLASS_NAME, "chart-container")
                logger.info("Found chart-container element")
                return element
            except:
                logger.error("Could not find chart element")
                # List all elements for debugging
                elements = self.driver.find_elements(By.TAG_NAME, "div")
                logger.debug(f"Found {len(elements)} div elements on page")
                for i, elem in enumerate(elements[:10]):  # Log first 10
                    classes = elem.get_attribute("class") or "no-class"
                    logger.debug(f"Div {i}: classes='{classes}'")
                return None
    
    def capture_chart_frame(self):
        """Capture a single frame of the chart"""
        try:
            chart_element = self.get_chart_element()
            if not chart_element:
                return None
            
            # Get element screenshot
            screenshot = chart_element.screenshot_as_png
            
            # Convert to PIL Image
            image = Image.open(io.BytesIO(screenshot))
            return np.array(image)
            
        except Exception as e:
            print(f"Error capturing frame: {e}")
            return None
    
    def record_animation(self, duration_seconds=10, fps=30):
        """Record the chart animation for specified duration"""
        logger.info(f"Recording animation for {duration_seconds} seconds at {fps} FPS...")
        
        frame_interval = 1.0 / fps
        total_frames = int(duration_seconds * fps)
        
        self.frames = []
        
        for frame_num in range(total_frames):
            start_time = time.time()
            
            # Capture frame
            frame = self.capture_chart_frame()
            if frame is not None:
                self.frames.append(frame)
                if frame_num % 30 == 0:  # Log every 30 frames
                    logger.info(f"Captured frame {frame_num + 1}/{total_frames}")
                print(f"Captured frame {frame_num + 1}/{total_frames}", end='\r')
            else:
                logger.warning(f"Failed to capture frame {frame_num + 1}")
            
            # Maintain frame rate
            elapsed = time.time() - start_time
            sleep_time = max(0, frame_interval - elapsed)
            time.sleep(sleep_time)
        
        logger.info(f"\nCaptured {len(self.frames)} frames total")
        print(f"\nCaptured {len(self.frames)} frames")
        return len(self.frames) > 0
    
    def save_as_gif(self, output_path, duration=None):
        """Save recorded frames as GIF"""
        if not self.frames:
            print("No frames to save")
            return False
        
        try:
            # Convert numpy arrays to PIL Images
            pil_frames = []
            for frame in self.frames:
                if frame.shape[2] == 4:  # RGBA
                    pil_frame = Image.fromarray(frame, 'RGBA')
                else:  # RGB
                    pil_frame = Image.fromarray(frame, 'RGB')
                pil_frames.append(pil_frame)
            
            # Calculate frame duration
            if duration is None:
                duration = 100  # 100ms per frame (10 FPS)
            
            # Save GIF
            pil_frames[0].save(
                output_path,
                save_all=True,
                append_images=pil_frames[1:],
                duration=duration,
                loop=0,
                optimize=True
            )
            
            print(f"GIF saved: {output_path}")
            return True
            
        except Exception as e:
            print(f"Error saving GIF: {e}")
            return False
    
    def save_as_mp4(self, output_path, fps=30):
        """Save recorded frames as MP4 video"""
        if not self.frames:
            print("No frames to save")
            return False
        
        try:
            # Setup video writer
            height, width = self.frames[0].shape[:2]
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            for frame in self.frames:
                # Convert RGB to BGR for OpenCV
                if len(frame.shape) == 3 and frame.shape[2] == 3:
                    bgr_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                elif len(frame.shape) == 3 and frame.shape[2] == 4:
                    bgr_frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
                else:
                    bgr_frame = frame
                
                writer.write(bgr_frame)
            
            writer.release()
            print(f"MP4 saved: {output_path}")
            return True
            
        except Exception as e:
            print(f"Error saving MP4: {e}")
            return False
    
    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()


def main():
    parser = argparse.ArgumentParser(description="Record chart animations")
    parser.add_argument("--url", default="http://localhost:5174", help="Base URL of the application")
    parser.add_argument("--output", default="chart_animation", help="Output filename (without extension)")
    parser.add_argument("--format", choices=["gif", "mp4", "both"], default="gif", help="Output format")
    parser.add_argument("--duration", type=int, default=10, help="Recording duration in seconds")
    parser.add_argument("--fps", type=int, default=30, help="Frames per second")
    parser.add_argument("--headless", action="store_true", help="Run browser in headless mode")
    parser.add_argument("--x-columns", nargs="+", help="X-axis columns for animation")
    parser.add_argument("--y-columns", nargs="+", help="Y-axis columns for animation")
    parser.add_argument("--speed", type=float, default=2.0, help="Animation speed (seconds per frame)")
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")
    
    args = parser.parse_args()
    
    # Set debug level if requested
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    logger.info(f"Starting chart recording with args: {vars(args)}")
    
    recorder = ChartAnimationRecorder(args.url, args.headless)
    
    try:
        logger.info("Setting up browser...")
        print("Setting up browser...")
        recorder.setup_driver()
        
        logger.info(f"Loading chart from {args.url}...")
        print(f"Loading chart from {args.url}...")
        recorder.driver.get(args.url)
        
        # Log current URL and title for debugging
        logger.info(f"Current URL: {recorder.driver.current_url}")
        logger.info(f"Page title: {recorder.driver.title}")
        
        if not recorder.wait_for_chart_load():
            logger.error("Failed to load chart")
            print("Failed to load chart")
            return 1
        
        if args.x_columns or args.y_columns:
            logger.info("Configuring animation...")
            print("Configuring animation...")
            recorder.setup_animation(args.x_columns, args.y_columns, args.speed)
        
        logger.info("Starting recording...")
        print("Starting recording...")
        if not recorder.record_animation(args.duration, args.fps):
            logger.error("Failed to record animation")
            print("Failed to record animation")
            return 1
        
        # Save in requested format(s)
        if args.format in ["gif", "both"]:
            gif_path = f"{args.output}.gif"
            logger.info(f"Saving GIF to {gif_path}...")
            recorder.save_as_gif(gif_path, duration=int(1000/args.fps))
        
        if args.format in ["mp4", "both"]:
            mp4_path = f"{args.output}.mp4"
            logger.info(f"Saving MP4 to {mp4_path}...")
            recorder.save_as_mp4(mp4_path, args.fps)
        
        logger.info("Recording completed successfully!")
        print("Recording completed successfully!")
        return 0
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        print(f"Error: {e}")
        return 1
        
    finally:
        logger.info("Cleaning up...")
        recorder.cleanup()


if __name__ == "__main__":
    import io
    sys.exit(main())
