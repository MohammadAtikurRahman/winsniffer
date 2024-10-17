// const { windowManager } = require('node-window-manager');

// // Function to get the active window dimensions
// function getActiveWindowDimensions() {
//   const activeWindow = windowManager.getActiveWindow();

//   if (activeWindow && activeWindow.path.toLowerCase().includes('chrome')) {
//     const windowBounds = activeWindow.getBounds();
//     console.log(`Chrome window size: Width = ${windowBounds.width}, Height = ${windowBounds.height}`);
//   } else {
//     console.log(`Active window is not Chrome. Current window: ${activeWindow ? activeWindow.getTitle() : 'None'}`);
//   }
// }

// // Monitor the active window and log the dimensions if it's Chrome
// function monitorWindowSize() {
//   setInterval(() => {
//     getActiveWindowDimensions();
//   }, 500); // Check every 500ms
// }

// // Start monitoring the active window size
// monitorWindowSize();
