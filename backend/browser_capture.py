"""
Simple browser automation that works with the current browser session
Instead of creating a new browser, this approach uses JavaScript injection
to capture frames directly from the current browser session
"""

import time
import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from PIL import Image
import tempfile
import base64
import io

def create_animation_from_current_browser(frames: List[Dict[str, Any]], output_path: str, animation_config: Dict[str, Any]) -> str:
    """
    Create animation by sending JavaScript commands to the current browser
    This approach doesn't need Selenium - it works with the browser you're already using
    """
    try:
        # This is a placeholder - in a real implementation, we would:
        # 1. Use a WebSocket connection to communicate with the browser
        # 2. Or return JavaScript code that the frontend can execute
        # 3. Or use browser APIs to capture frames directly
        
        # For now, let's create a simple static GIF as proof of concept
        frames_data = []
        
        # Create some test frames (placeholder)
        for i in range(len(frames)):
            # Create a simple colored rectangle as placeholder
            img = Image.new('RGB', (800, 600), color=(i * 50 % 255, 100, 150))
            frames_data.append(img)
        
        # Save as GIF
        if frames_data:
            frames_data[0].save(
                output_path,
                save_all=True,
                append_images=frames_data[1:],
                duration=animation_config.get('frameDelay', 1000),
                loop=0,
                optimize=True
            )
            
        return output_path
        
    except Exception as e:
        print(f"Failed to create animation: {e}")
        raise

def generate_browser_capture_script(frames: List[Dict[str, Any]], animation_config: Dict[str, Any]) -> str:
"""
"""
Browser-based chart animation capture using JavaScript
This approach runs in the user's current browser session with their data
"""
import json

def generate_browser_capture_script(frames_config, animation_config):
    """
    Generate JavaScript code that will execute in the user's browser to capture animation frames
    """
    frame_delay = animation_config.get('frameDelay', 1000)
    frames_json = json.dumps(frames_config)
    
    script = f"""
    // Animation capture script - runs in current browser session
    window.captureFrames = async function() {{
        const frames = [];
        const framesConfig = {frames_json};
        const frameDelay = {frame_delay};
        
        console.log('Starting browser-based animation capture...');
        console.log('Frames to capture:', framesConfig.length);
        
        // Import html2canvas dynamically
        let html2canvas;
        try {{
            // Check if html2canvas is already available globally
            if (window.html2canvas) {{
                html2canvas = window.html2canvas;
            }} else {{
                // Try to import it
                const module = await import('html2canvas');
                html2canvas = module.default || module;
            }}
        }} catch (error) {{
            console.error('html2canvas not available:', error);
            throw new Error('html2canvas library not found. Please install it: npm install html2canvas');
        }}
        
        // Find the chart container - look for recharts containers
        const chartContainer = document.querySelector('.recharts-wrapper') || 
                             document.querySelector('[data-testid="chart-container"]') ||
                             document.querySelector('.chart-container') ||
                             document.querySelector('.recharts-responsive-container');
        
        if (!chartContainer) {{
            throw new Error('Chart container not found. Make sure you are in Chart view.');
        }}
        
        console.log('Found chart container:', chartContainer);
        
        // Function to update chart configuration
        const updateChartConfig = async (frameConfig) => {{
            // Dispatch custom event to update chart configuration
            const event = new CustomEvent('updateChartConfig', {{
                detail: frameConfig
            }});
            window.dispatchEvent(event);
            
            // Wait for chart to update
            await new Promise(resolve => setTimeout(resolve, 500));
        }};
        
        // Capture each frame
        for (let i = 0; i < framesConfig.length; i++) {{
            const frameConfig = framesConfig[i];
            console.log(`Capturing frame ${{i + 1}}/${{framesConfig.length}}:`, frameConfig);
            
            try {{
                // Update chart configuration
                await updateChartConfig(frameConfig);
                
                // Wait a bit more for animations to settle
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Capture the chart
                const canvas = await html2canvas(chartContainer, {{
                    backgroundColor: '#ffffff',
                    scale: 1,
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    width: chartContainer.offsetWidth,
                    height: chartContainer.offsetHeight
                }});
                
                // Convert to base64
                const frameData = canvas.toDataURL('image/png');
                frames.push(frameData);
                
                console.log(`Frame ${{i + 1}} captured successfully`);
                
                // Wait before next frame
                if (i < framesConfig.length - 1) {{
                    await new Promise(resolve => setTimeout(resolve, 200));
                }}
                
            }} catch (error) {{
                console.error(`Error capturing frame ${{i + 1}}:`, error);
                throw new Error(`Failed to capture frame ${{i + 1}}: ${{error.message}}`);
            }}
        }}
        
        console.log('All frames captured successfully:', frames.length);
        return frames;
    }};
    
    // Also set up a listener for chart config updates (for React components to listen to)
    console.log('Browser capture script loaded. Use window.captureFrames() to start capture.');
    """
    
    return script
"""

def generate_browser_capture_script(frames_config, animation_config):
    """
    Generate JavaScript code that will execute in the user's browser to capture animation frames
    """
    frame_delay = animation_config.get('frameDelay', 1000)
    
    script = f"""
    // Animation capture script - runs in current browser session
    window.captureFrames = async function() {{
        const frames = [];
        const framesConfig = {frames_config};
        const frameDelay = {frame_delay};
        
        console.log('Starting browser-based animation capture...');
        console.log('Frames to capture:', framesConfig.length);
        
        // Import html2canvas dynamically
        let html2canvas;
        try {{
            // Check if html2canvas is already available globally
            if (window.html2canvas) {{
                html2canvas = window.html2canvas;
            }} else {{
                // Try to import it
                const module = await import('html2canvas');
                html2canvas = module.default || module;
            }}
        }} catch (error) {{
            console.error('html2canvas not available:', error);
            throw new Error('html2canvas library not found. Please install it: npm install html2canvas');
        }}
        
        // Find the chart container - look for recharts containers
        const chartContainer = document.querySelector('.recharts-wrapper') || 
                             document.querySelector('[data-testid="chart-container"]') ||
                             document.querySelector('.chart-container') ||
                             document.querySelector('.recharts-responsive-container');
        
        if (!chartContainer) {{
            throw new Error('Chart container not found. Make sure you are in Chart view.');
        }}
        
        console.log('Found chart container:', chartContainer);
        
        // Function to update chart configuration
        const updateChartConfig = async (frameConfig) => {{
            // Dispatch custom event to update chart configuration
            const event = new CustomEvent('updateChartConfig', {{
                detail: frameConfig
            }});
            window.dispatchEvent(event);
            
            // Wait for chart to update
            await new Promise(resolve => setTimeout(resolve, 500));
        }};
        
        // Capture each frame
        for (let i = 0; i < framesConfig.length; i++) {{
            const frameConfig = framesConfig[i];
            console.log(`Capturing frame ${{i + 1}}/${{framesConfig.length}}:`, frameConfig);
            
            try {{
                // Update chart configuration
                await updateChartConfig(frameConfig);
                
                // Wait a bit more for animations to settle
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Capture the chart
                const canvas = await html2canvas(chartContainer, {{
                    backgroundColor: '#ffffff',
                    scale: 1,
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    width: chartContainer.offsetWidth,
                    height: chartContainer.offsetHeight
                }});
                
                // Convert to base64
                const frameData = canvas.toDataURL('image/png');
                frames.push(frameData);
                
                console.log(`Frame ${{i + 1}} captured successfully`);
                
                // Wait before next frame
                if (i < framesConfig.length - 1) {{
                    await new Promise(resolve => setTimeout(resolve, 200));
                }}
                
            }} catch (error) {{
                console.error(`Error capturing frame ${{i + 1}}:`, error);
                throw new Error(`Failed to capture frame ${{i + 1}}: ${{error.message}}`);
            }}
        }}
        
        console.log('All frames captured successfully:', frames.length);
        return frames;
    }};
    
    // Also set up a listener for chart config updates (for React components to listen to)
    console.log('Browser capture script loaded. Use window.captureFrames() to start capture.');
    """
    
    return script    script = f"""
    // Browser-based animation capture script
    (async function() {{
        console.log('Starting browser animation capture...');
        
        const frames = {json.dumps(frames)};
        const config = {json.dumps(animation_config)};
        const capturedFrames = [];
        
        // Function to update chart configuration
        function updateChart(frameConfig) {{
            // Try multiple methods to update the chart
            if (window.updateChartConfig) {{
                window.updateChartConfig(frameConfig);
            }} else {{
                // Dispatch custom event
                const event = new CustomEvent('chartConfigUpdate', {{
                    detail: frameConfig
                }});
                document.dispatchEvent(event);
            }}
        }}
        
        // Function to capture current frame
        async function captureFrame() {{
            const chartElement = document.querySelector('.recharts-wrapper, .chart-container, svg');
            if (!chartElement) {{
                console.error('No chart element found');
                return null;
            }}
            
            // Use html2canvas to capture the chart
            if (window.html2canvas) {{
                try {{
                    const canvas = await html2canvas(chartElement, {{
                        backgroundColor: '#ffffff',
                        scale: 1,
                        logging: false
                    }});
                    return canvas.toDataURL('image/png');
                }} catch (error) {{
                    console.error('Failed to capture frame:', error);
                    return null;
                }}
            }} else {{
                console.error('html2canvas not available');
                return null;
            }}
        }}
        
        // Capture frames for each configuration
        for (let i = 0; i < frames.length; i++) {{
            console.log(`Capturing frame ${{i + 1}}/${{frames.length}}`);
            
            // Update chart configuration
            updateChart(frames[i]);
            
            // Wait for animation to settle
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Capture frame
            const frameData = await captureFrame();
            if (frameData) {{
                capturedFrames.push(frameData);
            }}
        }}
        
        // Send frames to backend for GIF creation
        if (capturedFrames.length > 0) {{
            try {{
                const response = await fetch('http://localhost:8000/api/create-gif-from-frames', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json'
                    }},
                    body: JSON.stringify({{
                        frames: capturedFrames,
                        config: config
                    }})
                }});
                
                if (response.ok) {{
                    const result = await response.json();
                    console.log('GIF created successfully:', result);
                    
                    // Download the GIF
                    const downloadUrl = `http://localhost:8000/api/download-file/${{result.filename}}`;
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = result.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    return result;
                }} else {{
                    throw new Error('Failed to create GIF');
                }}
            }} catch (error) {{
                console.error('Failed to send frames to backend:', error);
                throw error;
            }}
        }} else {{
            throw new Error('No frames were captured');
        }}
    }})();
    """
    
    return script
