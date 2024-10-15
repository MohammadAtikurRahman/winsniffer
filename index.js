const { exec } = require('child_process');

// Function to get browser processes in real-time
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

    if (stdout) {
      console.clear(); // Clear the console to show updated output
      console.log(`Browser Tabs:`);
      console.log(stdout); // Display the output from PowerShell
    }
  });
}

// Set interval to continuously monitor tabs
setInterval(getBrowserTabs, 2000); // Check every 2 seconds
