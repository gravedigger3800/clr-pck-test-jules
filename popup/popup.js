// JavaScript for ModernPick popup functionality
console.log("ModernPick popup.js loaded");

document.addEventListener('DOMContentLoaded', () => {
  const eyedropperBtn = document.getElementById('eyedropper-btn');
  const colorSwatch = document.getElementById('color-swatch');
  const colorValueDisplay = document.getElementById('color-value');
  const cssColorNameDisplay = document.getElementById('css-color-name');
  const formatButtons = document.querySelectorAll('.format-btn');
  const historySizeSelect = document.getElementById('history-size-select');
  const notificationArea = document.getElementById('notification-area');
  let notificationTimeout = null;
  // Later: const copyBtn = document.getElementById('copy-btn');

  // --- Global state for the current color and format ---
  let currentColor = {
    hex: '#FFFFFF',
    rgb: { r: 255, g: 255, b: 255 },
    hsl: { h: 0, s: 0, l: 100 }
  };
  let activeFormat = 'hex'; // Default format
  let currentHistoryLimit; // Declare here

  // --- Chrome Storage Constants for Color History ---
  const COLOR_HISTORY_KEY = 'modernPickColorHistory';

  // --- Default Settings (fallback if not in storage) ---
  const DEFAULT_SETTINGS = {
    historySize: 5,
    defaultFormat: 'hex' 
  };

  // Initialize activeFormat and currentHistoryLimit from default settings initially
  activeFormat = DEFAULT_SETTINGS.defaultFormat;
  currentHistoryLimit = DEFAULT_SETTINGS.historySize; // Initialize here

  // --- CSS Named Colors Database --- 
  // MOVED HERE - AFTER DEFAULT_SETTINGS and currentHistoryLimit are set up
  const CSS_NAMED_COLORS = Object.freeze({
    "aliceblue": "#F0F8FF",
    "antiquewhite": "#FAEBD7",
    "aqua": "#00FFFF",
    "aquamarine": "#7FFFD4",
    "azure": "#F0FFFF",
    "beige": "#F5F5DC",
    "bisque": "#FFE4C4",
    "black": "#000000",
    "blanchedalmond": "#FFEBCD",
    "blue": "#0000FF",
    "blueviolet": "#8A2BE2",
    "brown": "#A52A2A",
    "burlywood": "#DEB887",
    "cadetblue": "#5F9EA0",
    "chartreuse": "#7FFF00",
    "chocolate": "#D2691E",
    "coral": "#FF7F50",
    "cornflowerblue": "#6495ED",
    "cornsilk": "#FFF8DC",
    "crimson": "#DC143C",
    "cyan": "#00FFFF",
    "darkblue": "#00008B",
    "darkcyan": "#008B8B",
    "darkgoldenrod": "#B8860B",
    "darkgray": "#A9A9A9",
    "darkgreen": "#006400",
    "darkgrey": "#A9A9A9",
    "darkkhaki": "#BDB76B",
    "darkmagenta": "#8B008B",
    "darkolivegreen": "#556B2F",
    "darkorange": "#FF8C00",
    "darkorchid": "#9932CC",
    "darkred": "#8B0000",
    "darksalmon": "#E9967A",
    "darkseagreen": "#8FBC8F",
    "darkslateblue": "#483D8B",
    "darkslategray": "#2F4F4F",
    "darkslategrey": "#2F4F4F",
    "darkturquoise": "#00CED1",
    "darkviolet": "#9400D3",
    "deeppink": "#FF1493",
    "deepskyblue": "#00BFFF",
    "dimgray": "#696969",
    "dimgrey": "#696969",
    "dodgerblue": "#1E90FF",
    "firebrick": "#B22222",
    "floralwhite": "#FFFAF0",
    "forestgreen": "#228B22",
    "fuchsia": "#FF00FF",
    "gainsboro": "#DCDCDC",
    "ghostwhite": "#F8F8FF",
    "gold": "#FFD700",
    "goldenrod": "#DAA520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#ADFF2F",
    "grey": "#808080",
    "honeydew": "#F0FFF0",
    "hotpink": "#FF69B4",
    "indianred": "#CD5C5C",
    "indigo": "#4B0082",
    "ivory": "#FFFFF0",
    "khaki": "#F0E68C",
    "lavender": "#E6E6FA",
    "lavenderblush": "#FFF0F5",
    "lawngreen": "#7CFC00",
    "lemonchiffon": "#FFFACD",
    "lightblue": "#ADD8E6",
    "lightcoral": "#F08080",
    "lightcyan": "#E0FFFF",
    "lightgoldenrodyellow": "#FAFAD2",
    "lightgray": "#D3D3D3",
    "lightgreen": "#90EE90",
    "lightgrey": "#D3D3D3",
    "lightpink": "#FFB6C1",
    "lightsalmon": "#FFA07A",
    "lightseagreen": "#20B2AA",
    "lightskyblue": "#87CEFA",
    "lightslategray": "#778899",
    "lightslategrey": "#778899",
    "lightsteelblue": "#B0C4DE",
    "lightyellow": "#FFFFE0",
    "lime": "#00FF00",
    "limegreen": "#32CD32",
    "linen": "#FAF0E6",
    "magenta": "#FF00FF",
    "maroon": "#800000",
    "mediumaquamarine": "#66CDAA",
    "mediumblue": "#0000CD",
    "mediumorchid": "#BA55D3",
    "mediumpurple": "#9370DB",
    "mediumseagreen": "#3CB371",
    "mediumslateblue": "#7B68EE",
    "mediumspringgreen": "#00FA9A",
    "mediumturquoise": "#48D1CC",
    "mediumvioletred": "#C71585",
    "midnightblue": "#191970",
    "mintcream": "#F5FFFA",
    "mistyrose": "#FFE4E1",
    "moccasin": "#FFE4B5",
    "navajowhite": "#FFDEAD",
    "navy": "#000080",
    "oldlace": "#FDF5E6",
    "olive": "#808000",
    "olivedrab": "#6B8E23",
    "orange": "#FFA500",
    "orangered": "#FF4500",
    "orchid": "#DA70D6",
    "palegoldenrod": "#EEE8AA",
    "palegreen": "#98FB98",
    "paleturquoise": "#AFEEEE",
    "palevioletred": "#DB7093",
    "papayawhip": "#FFEFD5",
    "peachpuff": "#FFDAB9",
    "peru": "#CD853F",
    "pink": "#FFC0CB",
    "plum": "#DDA0DD",
    "powderblue": "#B0E0E6",
    "purple": "#800080",
    "rebeccapurple": "#663399",
    "red": "#FF0000",
    "rosybrown": "#BC8F8F",
    "royalblue": "#4169E1",
    "saddlebrown": "#8B4513",
    "salmon": "#FA8072",
    "sandybrown": "#F4A460",
    "seagreen": "#2E8B57",
    "seashell": "#FFF5EE",
    "sienna": "#A0522D",
    "silver": "#C0C0C0",
    "skyblue": "#87CEEB",
    "slateblue": "#6A5ACD",
    "slategray": "#708090",
    "slategrey": "#708090",
    "snow": "#FFFAFA",
    "springgreen": "#00FF7F",
    "steelblue": "#4682B4",
    "tan": "#D2B48C",
    "teal": "#008080",
    "thistle": "#D8BFD8",
    "tomato": "#FF6347",
    "turquoise": "#40E0D0",
    "violet": "#EE82EE",
    "wheat": "#F5DEB3",
    "white": "#FFFFFF",
    "whitesmoke": "#F5F5F5",
    "yellow": "#FFFF00",
    "yellowgreen": "#9ACD32"
  });

  // --- NEW: Function to find CSS Named Color ---
  function findCssNamedColor(hexColor) {
    if (!hexColor) return null;
    const normalizedHex = hexColor.toUpperCase(); // Ensure consistent casing for comparison

    // Iterate over the CSS_NAMED_COLORS object
    for (const name in CSS_NAMED_COLORS) {
      if (CSS_NAMED_COLORS.hasOwnProperty(name)) {
        if (CSS_NAMED_COLORS[name].toUpperCase() === normalizedHex) {
          return name; // Found an exact match
        }
      }
    }
    return null; // No exact match found
  }

  // --- Color Conversion Utilities ---
  function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return { r, g, b };
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  // --- Chrome Storage Functions for Color History ---
  function saveColorToChromeStorage(colorObjectToSave) {
    chrome.storage.local.get({ [COLOR_HISTORY_KEY]: [] }, (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error loading color history for saving:", chrome.runtime.lastError);
        return;
      }
      let history = result[COLOR_HISTORY_KEY];
      // Remove existing entry if same hex, to update its timestamp and position
      history = history.filter(item => item.hex !== colorObjectToSave.hex);
      // Add new color to the beginning
      history.unshift({ ...colorObjectToSave, timestamp: Date.now() });
      // Limit history size
      history = history.slice(0, currentHistoryLimit);

      chrome.storage.local.set({ [COLOR_HISTORY_KEY]: history }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving color history:", chrome.runtime.lastError);
        } else {
          console.log("Color history saved:", history);
          displayColorHistoryInUI(history); // Update UI (placeholder for now)
        }
      });
    });
  }

  function loadColorHistoryFromChromeStorage(callback) {
    chrome.storage.local.get({ [COLOR_HISTORY_KEY]: [] }, (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error loading color history:", chrome.runtime.lastError);
        callback([]); // Pass empty array on error
        return;
      }
      callback(result[COLOR_HISTORY_KEY]);
    });
  }

  function clearColorHistoryFromChromeStorage(callback) {
    chrome.storage.local.remove(COLOR_HISTORY_KEY, () => {
      if (chrome.runtime.lastError) {
        console.error("Error clearing color history:", chrome.runtime.lastError);
      } else {
        console.log("Color history cleared.");
        if (callback) callback();
        displayColorHistoryInUI([]); // Update UI (placeholder for now)
      }
    });
  }

  // Placeholder for now - will be implemented in Subtask 5.3
  function displayColorHistoryInUI(historyArray) {
    // console.log("Displaying color history (placeholder):", historyArray);
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    historyList.innerHTML = ''; // Clear previous items

    if (!historyArray || historyArray.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'history-list-empty-message';
      emptyMessage.textContent = 'No colors in history yet.';
      historyList.appendChild(emptyMessage);
    } else {
      historyArray.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'history-swatch';
        swatch.style.backgroundColor = color.hex;
        swatch.title = `${color.hex} - Picked: ${new Date(color.timestamp).toLocaleTimeString()}`;
        swatch.dataset.hex = color.hex; // Store hex for easy access

        swatch.addEventListener('click', () => {
          // When a history swatch is clicked, update the main color display
          // BUT DO NOT re-order the history list.
          // The 'color' object from the historyArray already contains hex, rgb, and hsl.
          currentColor.hex = color.hex;
          currentColor.rgb = color.rgb;
          currentColor.hsl = color.hsl;
          // console.log("Clicked history color:", color);
          // console.log("Updated global currentColor:", currentColor);
          displayColorInUI(); // Refresh the main display area
        });
        historyList.appendChild(swatch);
      });
    }
  }

  // --- UI Update Functions ---
  function displayColorInUI() {
    if (colorSwatch && colorValueDisplay && cssColorNameDisplay) {
      colorSwatch.style.backgroundColor = currentColor.hex;
      let displayValue = '';
      switch (activeFormat) {
        case 'hex':
          displayValue = currentColor.hex.toUpperCase();
          break;
        case 'rgb':
          displayValue = `RGB(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`;
          break;
        case 'hsl':
          displayValue = `HSL(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`;
          break;
        default:
          displayValue = currentColor.hex.toUpperCase();
      }
      colorValueDisplay.textContent = displayValue;

      // Display CSS Named Color
      const namedColor = findCssNamedColor(currentColor.hex);
      cssColorNameDisplay.textContent = namedColor ? `(${namedColor})` : '';

    } else {
      console.error('UI elements for color display not found.');
    }
  }

  // --- Function to update all color formats from a HEX input ---
  function updateCurrentColor(hexColor) {
    currentColor.hex = hexColor.toUpperCase();
    currentColor.rgb = hexToRgb(currentColor.hex);
    currentColor.hsl = rgbToHsl(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b);
    console.log("Updated currentColor:", currentColor);
    displayColorInUI(); // Update the UI after processing
    saveColorToChromeStorage(currentColor); // Save to history
  }

  // --- Event Listeners ---

  // Eyedropper Button
  if (eyedropperBtn) {
    if (!window.EyeDropper) {
      console.error("EyeDropper API is not supported in this browser.");
      alert("Sorry, the EyeDropper API is not supported in your browser. The color picking feature will be disabled.");
      eyedropperBtn.textContent = 'Not Supported';
      eyedropperBtn.disabled = true;
    } else {
      eyedropperBtn.addEventListener('click', async () => {
        console.log("Eyedropper button clicked");
        try {
          const eyeDropper = new EyeDropper();
          eyedropperBtn.textContent = 'Picking...';
          eyedropperBtn.disabled = true;
          const result = await eyeDropper.open();
          console.log("Raw color selected:", result.sRGBHex);
          updateCurrentColor(result.sRGBHex);
        } catch (e) {
          console.error("Error using EyeDropper API:", e);
          const errorMessage = e.toString().toLowerCase();
          if (errorMessage.includes('user canceled') || errorMessage.includes('selection was aborted')) {
            console.log("Eyedropper selection canceled by user.");
          } else {
            showNotification("Color picker error. See console.", 'error');
            console.error("Unhandled EyeDropper error:", e);
          }
        } finally {
          eyedropperBtn.textContent = 'Pick Color';
          if (window.EyeDropper) {
            eyedropperBtn.disabled = false;
          }
        }
      });
    }
  } else {
    console.error("Eyedropper button not found.");
  }

  // Format Selector Buttons
  formatButtons.forEach(button => {
    button.addEventListener('click', () => {
      formatButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      activeFormat = button.dataset.format;
      displayColorInUI();

      // NEW: Save the newly selected format as the default
      // First, get the current settings to ensure we don't overwrite other existing settings.
      chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
        if (chrome.runtime.lastError || (response && response.error)) {
          console.error(
            "Error getting settings before saving default format:",
            chrome.runtime.lastError?.message || response?.error
          );
          // Fallback or error handling:
          // If we can't get settings, we could choose to save a new settings object
          // with just the defaultFormat, but this risks overwriting other settings.
          // For now, we log and don't save if there's an error fetching.
          // Alternatively, attempt to save only defaultFormat (simpler, but riskier if other settings exist)
          // chrome.runtime.sendMessage({ type: "saveSettings", settings: { defaultFormat: activeFormat, historySize: MAX_HISTORY_ITEMS /* or a default */ } }, ...);
          return;
        }

        // If settings are not yet initialized in storage (e.g., first ever click before background.js onInstalled fully runs or if storage got cleared)
        // or if background script returns empty settings for some reason.
        let currentSettings = response.settings || { ...DEFAULT_SETTINGS };
        
        currentSettings.defaultFormat = activeFormat; // Update the default format

        chrome.runtime.sendMessage(
          { type: "saveSettings", settings: currentSettings },
          (saveResponse) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error saving default format setting:",
                chrome.runtime.lastError.message
              );
            } else if (saveResponse && saveResponse.success) {
              console.log(
                "Default format setting saved:",
                activeFormat,
                "Full settings now:",
                currentSettings
              );
            } else {
              console.error(
                "Failed to save default format setting. Response:",
                saveResponse
              );
            }
          }
        );
      });
    });
  });

  // Initial UI update on popup open
  displayColorInUI();
  loadColorHistoryFromChromeStorage(displayColorHistoryInUI); // Load and display history

  // --- Settings Loading and Application ---
  function applySettings(settings) {
    const newSettings = settings || { ...DEFAULT_SETTINGS }; // Use defaults if settings are null/undefined

    activeFormat = newSettings.defaultFormat || DEFAULT_SETTINGS.defaultFormat;
    currentHistoryLimit = parseInt(newSettings.historySize, 10) || DEFAULT_SETTINGS.historySize; // NEW

    // Update UI to reflect the active format from settings
    formatButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.format === activeFormat) {
        btn.classList.add('active');
      }
    });

    // NEW: Update history size dropdown
    if (historySizeSelect) {
      historySizeSelect.value = currentHistoryLimit.toString();
    }

    console.log("Applied settings: activeFormat is", activeFormat, "historyLimit is", currentHistoryLimit);
    displayColorInUI(); // Now update UI with the correct format
  }

  function loadAndApplySettings() {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'getSettings' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting settings from background:", chrome.runtime.lastError.message);
          console.log("Using default settings for popup.");
          applySettings(DEFAULT_SETTINGS); // Apply defaults on error
        } else if (response && response.error) {
          console.error("Error from background getting settings:", response.error);
          console.log("Using default settings for popup.");
          applySettings(DEFAULT_SETTINGS); // Apply defaults on error from background
        } else if (response && response.settings) {
          console.log("Settings received from background:", response.settings);
          applySettings(response.settings);
        } else {
          // This case might happen if background script isn't ready or no settings are stored yet
          // and background script sends back an empty response or no settings field.
          console.log("No settings received from background or settings are empty, using defaults.");
          applySettings(DEFAULT_SETTINGS);
        }
        // Load history after settings are applied (especially if historySize becomes a setting)
        loadColorHistoryFromChromeStorage(displayColorHistoryInUI);
      });
    } else {
      // Fallback if chrome.runtime is not available (e.g. testing in a plain browser page)
      console.warn("chrome.runtime.sendMessage not available. Using default settings.");
      applySettings(DEFAULT_SETTINGS);
      loadColorHistoryFromChromeStorage(displayColorHistoryInUI);
    }
  }

  // Load settings when DOM is ready
  loadAndApplySettings();

  // --- NEW: Notification Function ---
  function showNotification(message, type = 'info', duration = 3000) {
    if (!notificationArea) return;

    // Clear any existing timeout to prevent premature hiding if called again quickly
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    notificationArea.textContent = message;
    notificationArea.className = 'notification'; // Reset classes
    if (type === 'success') {
      notificationArea.classList.add('success');
    } else if (type === 'error') {
      notificationArea.classList.add('error');
    } // else it's just default 'info' styling (if we add it later)
    
    notificationArea.classList.add('visible');

    notificationTimeout = setTimeout(() => {
      notificationArea.classList.remove('visible');
      // Optional: wait for transition to finish before truly hiding with display:none
      // This depends on a more complex setup or can be handled by CSS if opacity hides it enough
    }, duration);
  }

  // --- NEW: Event Listener for History Size Select ---
  if (historySizeSelect) {
    historySizeSelect.addEventListener('change', () => {
      const newSize = parseInt(historySizeSelect.value, 10);
      if (isNaN(newSize)) {
        console.error("Invalid history size selected:", historySizeSelect.value);
        return;
      }

      console.log("History size changed to:", newSize);
      currentHistoryLimit = newSize; // Update global limit immediately for UI responsiveness

      // Save the new setting to storage
      chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
        if (chrome.runtime.lastError || (response && response.error)) {
          console.error(
            "Error getting settings before saving history size:",
            chrome.runtime.lastError?.message || response?.error
          );
          return;
        }

        let currentSettings = response.settings || { ...DEFAULT_SETTINGS };
        currentSettings.historySize = newSize;

        chrome.runtime.sendMessage(
          { type: "saveSettings", settings: currentSettings },
          (saveResponse) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error saving history size setting:",
                chrome.runtime.lastError.message
              );
            } else if (saveResponse && saveResponse.success) {
              console.log(
                "History size setting saved:",
                newSize,
                "Full settings now:",
                currentSettings
              );
              // Reload and display history with the new limit
              // This ensures the displayed history is trimmed/adjusted immediately
              loadColorHistoryFromChromeStorage((historyArray) => {
                // The saveColorToChromeStorage, if called (e.g., by picking a new color),
                // will use the new currentHistoryLimit. Here, we just need to ensure
                // the display reflects any potential trimming from existing full history.
                // A more direct way to trim if historyArray is longer than newSize:
                const possiblyTrimmedHistory = historyArray.slice(0, newSize);
                if (possiblyTrimmedHistory.length < historyArray.length) {
                    // If trimming occurred, we should ideally also re-save this trimmed history
                    // to ensure persistence of the trim, but saveColorToChromeStorage
                    // already handles adding new items correctly. This is more for immediate display update.
                    // For now, just displaying the trimmed version. The next color save will enforce it.
                     chrome.storage.local.set({ [COLOR_HISTORY_KEY]: possiblyTrimmedHistory }, () => {
                        if (chrome.runtime.lastError) {
                          console.error("Error re-saving trimmed color history:", chrome.runtime.lastError.message);
                        } else {
                          console.log("Trimmed color history re-saved successfully after size change.");
                        }
                        displayColorHistoryInUI(possiblyTrimmedHistory);
                     });
                } else {
                    displayColorHistoryInUI(possiblyTrimmedHistory); // or historyArray, it's the same
                }
              });
            } else {
              console.error(
                "Failed to save history size setting. Response:",
                saveResponse
              );
            }
          }
        );
      });
    });
  }

  // --- Content Script Communication ---
  async function getDominantPageColors() {
    console.log("Attempting to get dominant page colors...");
    try {
      // Query for the active tab in the current window
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tabs || tabs.length === 0 || !tabs[0] || !tabs[0].id) {
        console.warn("No active tab found or tab ID missing for getDominantPageColors.");
        return [];
      }
      const activeTabId = tabs[0].id;

      return new Promise((resolve) => {
        chrome.tabs.sendMessage(activeTabId, { type: 'getPageColors' }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn(`Error sending 'getPageColors' message to tab ${activeTabId}:`, chrome.runtime.lastError.message);
            // This can happen if the content script isn't injected on the page (e.g., chrome:// pages, file URLs by default)
            resolve([]); 
          } else if (response && response.colors) {
            console.log(`Colors received from tab ${activeTabId}:`, response.colors);
            resolve(response.colors);
          } else {
            console.warn(`No colors received from tab ${activeTabId} or unexpected response format.`);
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.error('Error in getDominantPageColors wrapper:', error);
      return []; // Return empty array on any other error
    }
  }

  // Example usage (can be triggered by a button later):
  // async function testGetPageColors() {
  //   const pageColors = await getDominantPageColors();
  //   console.log("Dominant Page Colors from test function:", pageColors);
  //   // In a real feature, you'd display these colors in the UI.
  // }
  // // To test manually from console after popup loads: testGetPageColors();

  // Clear History Button
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      // Confirmation could be added here if desired
      clearColorHistoryFromChromeStorage(() => {
        // The callback in clearColorHistoryFromChromeStorage already calls displayColorHistoryInUI([])
        console.log("History cleared and UI updated via callback.");
      });
    });
  } else {
    console.error("Clear history button not found.");
  }

  // Copy Button
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      copyBtn.addEventListener('click', () => {
        const textToCopy = colorValueDisplay.textContent;
        if (!textToCopy) {
          showNotification("Nothing to copy!", "error");
          return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
          // Visual feedback on button itself IS the primary feedback now
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          copyBtn.disabled = true; 
          copyBtn.classList.add('copied'); 
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.disabled = false;
            copyBtn.classList.remove('copied');
          }, 1500); 
        }).catch(err => {
          console.error('Failed to copy text: ', err);
          showNotification("Failed to copy. See console.", "error");
        });
      });
    } else {
      console.warn("Clipboard API (writeText) not available.");
      copyBtn.textContent = 'Copy N/A';
      copyBtn.disabled = true;
      copyBtn.title = "Clipboard API is not supported in this context."; // Add a title for more info
    }
  } else {
    console.error("Copy button not found.");
  }
}); 