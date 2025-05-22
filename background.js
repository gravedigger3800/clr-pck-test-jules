// Background service worker for ModernPick
console.log("ModernPick background.js loaded");

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("ModernPick color picker installed or updated. Reason:", details.reason);

  // Initialize storage with default settings if not already set
  // or on first install.
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const defaultSettings = {
      historySize: 5,      // Default number of items in history
      defaultFormat: 'hex',  // Default color format to display
      // We could add more settings here in the future, e.g., autoCopy: false
    };
    chrome.storage.local.set({ modernPickSettings: defaultSettings }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error initializing default settings:", chrome.runtime.lastError);
      } else {
        console.log("Default settings initialized:", defaultSettings);
      }
    });
  }
  // For UPDATES, you might want to check existing settings and migrate/add new ones.
  // For now, we'll just initialize on first install.
});

// Listen for messages from popup or other extension parts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background:", message, "from sender:", sender);

  if (message.type === 'getActiveTabInfo') {
    // Example: How to get active tab info if needed by popup
    // Requires "tabs" permission in manifest if not already there for other reasons.
    // Currently, our manifest has "activeTab" which is different.
    // For this example to fully work, "tabs" might be needed or a more specific query.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error querying tabs:", chrome.runtime.lastError);
        sendResponse({ error: "Error querying tabs: " + chrome.runtime.lastError.message });
        return;
      }
      if (tabs && tabs.length > 0 && tabs[0]) {
        sendResponse({ tab: tabs[0] });
      } else {
        sendResponse({ error: 'No active tab found' });
      }
    });
    return true; // Required for async sendResponse
  } else if (message.type === 'getSettings') {
    chrome.storage.local.get('modernPickSettings', (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving settings:", chrome.runtime.lastError);
        sendResponse({ error: 'Failed to retrieve settings' });
      } else {
        sendResponse({ settings: result.modernPickSettings });
      }
    });
    return true; // Required for async sendResponse
  } else if (message.type === 'saveSettings') {
    if (message.settings) {
      chrome.storage.local.set({ modernPickSettings: message.settings }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving settings:", chrome.runtime.lastError);
          sendResponse({ success: false, error: 'Failed to save settings' });
        } else {
          console.log("Settings saved:", message.settings);
          sendResponse({ success: true });
        }
      });
    } else {
      sendResponse({ success: false, error: 'No settings provided to save' });
    }
    return true; // Required for async sendResponse
  }

  // Handle other message types if needed
  // sendResponse({ received: true }); // Example synchronous response
}); 