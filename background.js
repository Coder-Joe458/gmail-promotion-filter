chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed!');
    chrome.storage.sync.set({ keywords: [] });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "filterEmails") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].url.includes("mail.google.com")) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    } else {
                        chrome.tabs.sendMessage(tabs[0].id, { action: "filterEmails" }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError.message);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                            } else {
                                console.log("Filtering result:", response);
                                sendResponse({ success: true, result: response });
                            }
                        });
                    }
                });
            } else {
                sendResponse({ success: false, error: "Please open Gmail to filter emails." });
            }
        });
        return true; // Indicates that the response is sent asynchronously
    }
});
