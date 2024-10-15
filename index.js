const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to the data.json file
const dataFilePath = path.join(__dirname, 'data.json');

// Load existing data from data.json if it exists
let tabData = [];
if (fs.existsSync(dataFilePath)) {
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  tabData = JSON.parse(fileData || '[]');
}

// Function to save data to data.json
function saveData() {
  fs.writeFileSync(dataFilePath, JSON.stringify(tabData, null, 2), 'utf8');
}

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

        const existingTab = tabData.find(tab => tab.PID === pid && tab.Tab === tabTitle);

        if (existingTab) {
          // Only update the time if the last time is different
          const lastRecordedTime = existingTab.time[existingTab.time.length - 1];
          if (lastRecordedTime !== currentVisitTime) {
            existingTab.time.push(currentVisitTime);
          }
        } else {
          // Add new tab information if it doesn't exist
          tabData.push({
            PID: pid,
            Tab: tabTitle,
            browser: browserName,
            time: [currentVisitTime]
          });
        }
      }
    });

    // Save the updated data to data.json
    saveData();

    // Clear console for real-time updates and print the tab information
    console.clear();
    console.log('Updated Browser Tab Information:');
    console.log(JSON.stringify(tabData, null, 2));
  });
}

// Set an interval to check for tab changes every 2 seconds
setInterval(getBrowserTabs, 2000);
