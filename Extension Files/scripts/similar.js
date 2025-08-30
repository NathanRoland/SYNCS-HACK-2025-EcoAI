console.log("similar.js");

const similarButton = document.getElementById("similar-button");

similarButton.addEventListener("click", async () => {
    async function getCurrentUrl() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url;
    }
    const currentUrl = await getCurrentUrl();
    console.log(currentUrl);
    //url is sent to the backend
    const response = currentUrl;
    const similarContainer = document.getElementById("link-container");
    similarContainer.innerHTML = response;
});