// const { exec } = require('child_process');
// const fs = require('fs');
// const path = require('path');

// // Path to the data.json file
// const dataFilePath = path.join(__dirname, 'data.json');

// // Load existing data from data.json if it exists
// let tabDataMap = new Map(); // Map for fast lookup based on unique key (PID + Tab)
// if (fs.existsSync(dataFilePath)) {
//   const fileData = fs.readFileSync(dataFilePath, 'utf8');
//   const tabDataArray = JSON.parse(fileData || '[]');

//   // Populate the map with existing data for faster access
//   tabDataArray.forEach(tab => {
//     const tabKey = `${tab.PID}-${tab.Tab}`;
//     tabDataMap.set(tabKey, tab);
//   });
// }

// // Function to save data to data.json
// function saveData() {
//   const tabDataArray = Array.from(tabDataMap.values()); // Convert Map to array
//   fs.writeFileSync(dataFilePath, JSON.stringify(tabDataArray, null, 2), 'utf8');
// }

// // Format date for visit times
// function formatDate(date) {
//   return date.toLocaleString('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true
//   });
// }

// // Function to get browser tabs and track their time
// function getBrowserTabs() {
//   const psCommand = `Get-Process | Where-Object { ($_.MainWindowTitle) -and ($_.ProcessName -match 'chrome|firefox|msedge') } | Select-Object Id, ProcessName, MainWindowTitle`;

//   // Execute PowerShell command
//   exec(`powershell "${psCommand}"`, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error executing PowerShell command: ${error.message}`);
//       return;
//     }

//     if (stderr) {
//       console.error(`PowerShell Error: ${stderr}`);
//       return;
//     }

//     const lines = stdout.trim().split('\n').slice(1); // Remove header
//     const currentVisitTime = formatDate(new Date());

//     lines.forEach(line => {
//       const regex = /(\d+)\s+(\w+)\s+(.+)/; // Regex to parse PID, ProcessName, and Tab title
//       const match = line.match(regex);

//       if (match) {
//         const [, pid, processName, tabTitle] = match;

//         const browserName = processName === 'chrome' ? 'Google Chrome' :
//                             processName === 'firefox' ? 'Mozilla Firefox' :
//                             processName === 'msedge' ? 'Microsoft Edge' : 'Unknown';

//         const tabKey = `${pid}-${tabTitle}`; // Unique key for fast lookup

//         if (tabDataMap.has(tabKey)) {
//           // If the tab exists, only update if the time is different
//           const existingTab = tabDataMap.get(tabKey);
//           const lastRecordedTime = existingTab.time[existingTab.time.length - 1];

//           if (lastRecordedTime !== currentVisitTime) {
//             existingTab.time.push(currentVisitTime); // Push new visit time
//           }
//         } else {
//           // Add new tab if it doesn't exist
//           tabDataMap.set(tabKey, {
//             PID: pid,
//             Tab: tabTitle,
//             browser: browserName,
//             time: [currentVisitTime]
//           });
//         }
//       }
//     });

//     // Save the updated data to data.json
//     saveData();

//     // Clear console for real-time updates and print the tab information
//     console.clear();
//       console.log('Updated Browser Tab Information in JSON');
//   //  console.log(JSON.stringify(Array.from(tabDataMap.values()), null, 2)); // Convert map to array for display
//   });
// }

// // Set an interval to check for tab changes every 2 seconds
// setInterval(getBrowserTabs, 2000);


const { exec } = require('child_process');
const express = require('express');

// Initialize Express server
const app = express();
const port = 3000; // You can change the port if needed

// In-memory map to store tab data
let tabDataMap = new Map();

// Format date for visit times
function formatDate(date) {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Function to get browser tabs and track their time
function getBrowserTabs() {
  const psCommand = `Get-Process | Where-Object { ($_.MainWindowTitle) -and ($_.ProcessName -match 'chrome|firefox|msedge') } | Select-Object Id, ProcessName, MainWindowTitle`;

  // Execute PowerShell command
  exec(`powershell "${psCommand}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing PowerShell command: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`PowerShell Error: ${stderr}`);
      return;
    }

    const lines = stdout.trim().split('\n').slice(1); // Remove header
    const currentVisitTime = formatDate(new Date());

    lines.forEach(line => {
      const regex = /(\d+)\s+(\w+)\s+(.+)/; // Regex to parse PID, ProcessName, and Tab title
      const match = line.match(regex);

      if (match) {
        const [, pid, processName, tabTitle] = match;

        const browserName = processName === 'chrome' ? 'Google Chrome' :
                            processName === 'firefox' ? 'Mozilla Firefox' :
                            processName === 'msedge' ? 'Microsoft Edge' : 'Unknown';

        const tabKey = `${pid}-${tabTitle}`; // Unique key for fast lookup

        if (tabDataMap.has(tabKey)) {
          // If the tab exists, only update if the time is different
          const existingTab = tabDataMap.get(tabKey);
          const lastRecordedTime = existingTab.time[existingTab.time.length - 1];

          if (lastRecordedTime !== currentVisitTime) {
            existingTab.time.push(currentVisitTime); // Push new visit time
          }
        } else {
          // Add new tab if it doesn't exist
          tabDataMap.set(tabKey, {
            PID: pid,
            Tab: tabTitle,
            browser: browserName,
            time: [currentVisitTime]
          });
        }
      }
    });

    // For testing purposes, log data in the server console
    console.clear();
    console.log('Updated Browser Tab Information in JSON');
  });
}

// Set an interval to check for tab changes every 2 seconds
setInterval(getBrowserTabs, 2000);

// Define a route to return the tab data in JSON format
app.get('/tabs', (req, res) => {
  res.json(Array.from(tabDataMap.values())); // Convert map to array for JSON response
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
