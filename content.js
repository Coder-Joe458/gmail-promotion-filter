console.log("Gmail content script loaded");

async function filterEmails() {
  try {
    const { keywords = [] } = await chrome.storage.sync.get("keywords");
    if (keywords.length === 0) {
      return "No keywords defined. Please add keywords in the extension popup.";
    }

    // Create a search query from the keywords
    const searchQuery = keywords.map(keyword => `(${keyword})`).join(' OR ');
    const searchBox = document.querySelector('input[name="q"]');

    if (searchBox) {
      // Set the search query
      searchBox.value = searchQuery;
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));

      // Simulate pressing Enter to search
      const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13 // For compatibility
      });
      searchBox.dispatchEvent(enterEvent);

      // Wait for the search results to load
      await new Promise(resolve => setTimeout(resolve, 3000)); // Adjust time as needed

      return `Displayed emails matching: ${searchQuery}`;
    } else {
      return "Search box not found";
    }
  } catch (error) {
    console.error("Error in filterEmails:", error);
    return `Error: ${error.message}`;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "filterEmails") {
    console.log("Filtering emails...");
    filterEmails()
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates that the response is sent asynchronously
  }
});
