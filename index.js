const robot = require('robotjs');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const { windowManager } = require('node-window-manager');

// Function to get the active window
function getActiveWindow() {
  return windowManager.getActiveWindow();
}

// Capture the top area of the full desktop
function captureDesktopTopArea() {
  const screenSize = robot.getScreenSize();

  // Define the height of the top area you want to capture (e.g., 150 pixels)
  const captureHeight = 150;

  // Set the width to be the full screen width
  const captureWidth = screenSize.width;

  console.log(`Screen size detected: ${JSON.stringify(screenSize)}`);

  // Capture only a portion of the top area defined by desktop screen bounds
  const img = robot.screen.capture(0, 0, captureWidth, Math.min(captureHeight, screenSize.height));

  const png = new PNG({
    width: img.width,
    height: img.height,
  });

  const numPixels = img.width * img.height;
  const imgData = img.image;

  // Process the image data to save it as PNG
  for (let i = 0; i < numPixels; i++) {
    const pngIdx = i * 4;
    const imgIdx = i * 4;

    // RobotJS image data is in BGRA format
    const blue = imgData[imgIdx];
    const green = imgData[imgIdx + 1];
    const red = imgData[imgIdx + 2];

    // Map to RGBA format expected by PNGJS
    png.data[pngIdx] = red;
    png.data[pngIdx + 1] = green;
    png.data[pngIdx + 2] = blue;
    png.data[pngIdx + 3] = 255; // Set alpha to fully opaque
  }

  // Write the PNG file
  png
    .pack()
    .pipe(fs.createWriteStream('screenshot.png'))
    .on('finish', () => {
      console.log('Screenshot of desktop top area (full width) saved as desktop_top_area_full_width_screenshot.png');
    });
}

// Monitor the active window and capture if it's Chrome
function monitorActiveWindow() {
  setInterval(() => {
    const activeWindow = getActiveWindow();

    if (activeWindow && activeWindow.path && activeWindow.path.toLowerCase().includes('chrome')) {
      console.log(`Found active Google Chrome window: ${activeWindow.getTitle()}`);
      captureDesktopTopArea();
    } else {
      console.log(`Active window is not Chrome. Current window: ${activeWindow ? activeWindow.getTitle() : 'None'}`);
    }
  }, 500); // Check every 2 seconds
}

// Start monitoring the active window
monitorActiveWindow();
