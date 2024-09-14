document.addEventListener('DOMContentLoaded', () => {
    const keywordInput = document.getElementById('keyword');
    const addKeywordButton = document.getElementById('addKeyword');
    const keywordList = document.getElementById('keywordList');
    const filterEmailsButton = document.getElementById('filterEmails');
    const statusMessage = document.getElementById('statusMessage');

    // Load and display existing keywords
    chrome.storage.sync.get("keywords", ({ keywords = [] }) => {
        keywords.forEach(keyword => addKeywordToList(keyword));
    });

    addKeywordButton.addEventListener('click', () => {
        const keyword = keywordInput.value.trim();
        if (keyword) {
            chrome.storage.sync.get("keywords", ({ keywords = [] }) => {
                keywords.push(keyword);
                chrome.storage.sync.set({ keywords });
                addKeywordToList(keyword);
                keywordInput.value = '';
            });
        }
    });

    filterEmailsButton.addEventListener('click', () => {
        filterEmailsButton.disabled = true;
        filterEmailsButton.textContent = "Filtering...";
        statusMessage.textContent = "Filtering in progress...";

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].url.includes("mail.google.com")) {
                chrome.runtime.sendMessage({ action: "filterEmails" }, (response) => {
                    filterEmailsButton.disabled = false;
                    filterEmailsButton.textContent = "Filter Emails";
                    
                    if (response.success) {
                        statusMessage.textContent = response.result;
                    } else {
                        statusMessage.textContent = `Error: ${response.error}`;
                    }
                });
            } else {
                statusMessage.textContent = "Please open Gmail to filter emails.";
                filterEmailsButton.disabled = false;
                filterEmailsButton.textContent = "Filter Emails";
            }
        });
    });

    function addKeywordToList(keyword) {
        const li = document.createElement('li');
        li.textContent = keyword;
        keywordList.appendChild(li);
    }
});
