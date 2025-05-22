// Content script for ModernPick
console.log("ModernPick content.js loaded");

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message, "from sender:", sender);

  if (message.type === 'getPageColors') {
    // Extract dominant colors from the page
    const colors = extractDominantColorsFromPage();
    sendResponse({ colors: colors });
    return true; // Keep the message channel open for asynchronous response, though this one is sync for now
  } else if (message.type === 'pingContentScript') {
    // Simple ping for testing communication
    sendResponse({ success: true, message: "Content script is alive!" });
    return true;
  }
  // Add other message handlers as needed
});

// Function to extract dominant colors from the page (placeholder/basic implementation)
function extractDominantColorsFromPage() {
  console.log("extractDominantColorsFromPage called");
  const colorFrequencies = new Map();
  const elements = document.querySelectorAll('body, body * '); // Get all elements within body

  const commonBackgrounds = ['RGB(255, 255, 255)', 'RGB(248, 249, 250)', 'RGB(241, 243, 244)']; // Common light page backgrounds
  const commonTextColors = ['RGB(0, 0, 0)', 'RGB(33, 37, 41)', 'RGB(51, 51, 51)']; // Common dark text

  // Sample elements to avoid performance issues
  const sampleSize = Math.min(elements.length, 300); // Increased sample slightly
  const step = Math.max(1, Math.floor(elements.length / sampleSize));

  for (let i = 0; i < elements.length; i += step) {
    const element = elements[i];
    if (!element.checkVisibility || !element.checkVisibility()) { // Skip non-visible elements if API available
        // checkVisibility is a newer API, might not be on all user browsers, but good to have.
        // A more robust check would involve checking offsetParent, width, height etc.
        // For now, this is a progressive enhancement.
        // If not available, we process it. Worst case, we get colors from hidden elements.
    }

    try {
      const styles = window.getComputedStyle(element);
      
      const processColor = (colorStr, isBackground = false) => {
        const hex = normalizeAndConvertToHex(colorStr);
        if (hex) {
          // Basic filtering for very common colors if they are not part of a distinctive element.
          // This heuristic could be improved.
          let isCommonPageColor = false;
          if (isBackground && commonBackgrounds.includes(hex)) isCommonPageColor = true;
          if (!isBackground && commonTextColors.includes(hex)) isCommonPageColor = true;

          // If it's a common page color and the element is very large (like BODY or a main wrapper), be more skeptical.
          // This check is very basic.
          if (isCommonPageColor && (element.tagName === 'BODY' || element.offsetHeight * element.offsetWidth > window.innerHeight * window.innerWidth * 0.5) ) {
            // Potentially skip or give lower weight, for now, we'll just be aware
          } else {
            colorFrequencies.set(hex, (colorFrequencies.get(hex) || 0) + 1);
          }
        }
      };

      const bgColor = styles.backgroundColor;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        processColor(bgColor, true);
      }
      
      const textColor = styles.color;
      if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'transparent') {
        processColor(textColor);
      }

      const borderColor = styles.borderTopColor; 
      if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent') {
        processColor(borderColor);
      }

    } catch (e) {
      // console.warn("Could not get style for element:", element, e);
    }
  }
  
  // Sort colors by frequency
  const sortedColors = Array.from(colorFrequencies.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by frequency descending
    .map(entry => entry[0]);     // Get only the color hex

  console.log("Sorted colors by frequency (top 10):", sortedColors.slice(0, 10));
  return sortedColors.slice(0, 10); // Return top 10 most frequent colors
}

// Convert various color formats (like rgb(), rgba()) to HEX
function normalizeAndConvertToHex(colorString) {
    if (!colorString) return null;
    const str = String(colorString).trim().toUpperCase(); // Ensure it's a string

    if (str.startsWith('#')) {
        if (str.length === 4) { // #RGB
            return `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`;
        }
        if (str.length === 7) { // #RRGGBB
            return str;
        }
        // For #RRGGBBAA, we strip alpha for now as swatch doesn't show it well.
        // Or, decide if alpha colors should be handled differently (e.g. filtered out if not opaque)
        if (str.length === 9) { 
            return str.slice(0, 7);
        }
        return null; // Invalid hex length
    }

    const rgbMatch = str.match(/^RGBA?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[0-9\.]+)?\)$/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        // Basic validation for RGB values
        if (r > 255 || g > 255 || b > 255 || r < 0 || g < 0 || b < 0) return null;
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }
    
    // This function does not handle CSS named colors directly to HEX.
    // If a named color string is passed, it will likely return null unless it coincidentally matches a pattern.
    // A more robust named color to HEX map would be needed if getComputedStyle often returns them.
    return null; // Fallback for unknown formats or unhandled named colors
} 