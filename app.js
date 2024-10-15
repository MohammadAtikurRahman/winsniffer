// const robot = require('robotjs');
// const fs = require('fs');
// const PNG = require('pngjs').PNG;
// const { windowManager } = require('node-window-manager');

// // Find the Chrome window handle
// function findChromeWindowHandle() {
//   const windows = windowManager.getWindows();
  
//   // Logging to see all windows detected
//   windows.forEach(w => {
//     console.log(`Detected Window: ${w.path}`);
//   });
  
//   const chromeWindow = windows.find(w => w.path.toLowerCase().includes('chrome'));
//   if (!chromeWindow) {
//     console.error('Google Chrome window not found');
//     return null;
//   }
//   return chromeWindow;
// }

// // Bring the window to the front and capture
// function bringWindowToFrontAndCapture(window) {
//   if (!window) return;

//   // Bring Chrome window to the front
//   window.bringToTop();
  
//   // Adding a delay to ensure the window is fully focused
//   setTimeout(() => {
//     captureChromeWindow(window);
//   }, 500); // Delay of 500ms
// }

// // Capture the Chrome window
// function captureChromeWindow(window) {
//   if (!window) return;

//   const bounds = window.getBounds();
//   console.log(`Window bounds detected: ${JSON.stringify(bounds)}`);
  
//   // Capture the region defined by Chrome window bounds
//   const img = robot.screen.capture(bounds.x, bounds.y, bounds.width, bounds.height);

//   const png = new PNG({
//     width: img.width,
//     height: img.height,
//   });

//   const numPixels = img.width * img.height;
//   const imgData = img.image;

//   // Process the image data
//   for (let i = 0; i < numPixels; i++) {
//     const pngIdx = i * 4;
//     const imgIdx = i * 4;

//     // RobotJS image data is in BGRA format
//     const blue = imgData[imgIdx];
//     const green = imgData[imgIdx + 1];
//     const red = imgData[imgIdx + 2];

//     // Map to RGBA format expected by PNGJS
//     png.data[pngIdx] = red;
//     png.data[pngIdx + 1] = green;
//     png.data[pngIdx + 2] = blue;
//     png.data[pngIdx + 3] = 255; // Set alpha to fully opaque
//   }

//   // Write the PNG file
//   png
//     .pack()
//     .pipe(fs.createWriteStream('chrome_screenshot.png'))
//     .on('finish', () => {
//       console.log('Screenshot saved as chrome_screenshot.png');
//     });
// }

// // Main function to capture the screenshot
// function captureScreen() {
//   const chromeWindow = findChromeWindowHandle();
//   if (chromeWindow) {
//     bringWindowToFrontAndCapture(chromeWindow);
//   } else {
//     console.log('Chrome window not found. Please make sure Chrome is open and try again.');
//   }
// }

// // Capture Chrome window screenshot
// captureScreen();




const robot = require('robotjs');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const { windowManager } = require('node-window-manager');

// Function to get the active window
function getActiveWindow() {
  return windowManager.getActiveWindow();
}

// Capture the active Chrome window
function captureChromeWindow(window) {
  if (!window) return;

  const bounds = window.getBounds();
  console.log(`Window bounds detected: ${JSON.stringify(bounds)}`);
  
  // Capture the region defined by Chrome window bounds
  const img = robot.screen.capture(bounds.x, bounds.y, bounds.width, bounds.height);

  const png = new PNG({
    width: img.width,
    height: img.height,
  });

  const numPixels = img.width * img.height;
  const imgData = img.image;

  // Process the image data
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
    .pipe(fs.createWriteStream('chrome_screenshot.png'))
    .on('finish', () => {
      console.log('Screenshot saved as chrome_screenshot.png');
    });
}

// Monitor the active window and capture if it's Chrome
function monitorActiveWindow() {
  setInterval(() => {
    const activeWindow = getActiveWindow();
    
    if (activeWindow && activeWindow.path && activeWindow.path.toLowerCase().includes('chrome')) {
      console.log(`Found active Google Chrome window: ${activeWindow.getTitle()}`);
      captureChromeWindow(activeWindow);
    } else {
      console.log(`Active window is not Chrome. Current window: ${activeWindow ? activeWindow.getTitle() : 'None'}`);
    }
  }, 2000); // Check every 2 seconds
}

// Start monitoring the active window
monitorActiveWindow();
