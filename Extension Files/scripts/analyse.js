const analyseButton = document.getElementById("analyse-button");
const analyseContainer = document.getElementById("analyse-container");

let webScraper2;

document.addEventListener('DOMContentLoaded', () => {
    if (window.WebScraper) {
        webScraper2 = new window.WebScraper();
        console.log('WebScraper initialized successfully');
    } else {
        console.error('WebScraper not found. Make sure webscrape.js is loaded before similar.js');
    }
});

analyseButton.addEventListener("click", async () => {
    analyseContainer.innerHTML = "";
    async function getCurrentUrl() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url;
    }
    const currentUrl = await getCurrentUrl();
    console.log(currentUrl);
    //webScraper.scrapePage(currentUrl)
    const product_name = await webScraper2.scrapePage(currentUrl);
    console.log(product_name);
    //url is sent to the backend
    //const response = await fetch("http://localhost:3000/similar", {
    //    method: "POST",
    //    body: JSON.stringify({ url: currentUrl }),
    //});
    //const data = await response.json();
    const data = "this is another test response";
    console.log(data);
    analyseContainer.innerHTML = data;
});