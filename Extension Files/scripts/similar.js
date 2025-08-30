console.log("similar.js");


let webScraper;
const similarButton = document.getElementById("similar-button");
const similarContainer = document.getElementById("link-container");



document.addEventListener('DOMContentLoaded', () => {
    if (window.WebScraper) {
        webScraper = new window.WebScraper();
        console.log('WebScraper initialized successfully');
    } else {
        console.error('WebScraper not found. Make sure webscrape.js is loaded before similar.js');
    }
});

similarButton.addEventListener("click", async () => {
    similarContainer.innerHTML = "";
    async function getCurrentUrl() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url;
    }
    const currentUrl = await getCurrentUrl();
    console.log(currentUrl);
    //webScraper.scrapePage(currentUrl)
    const product_name = await webScraper.scrapePage(currentUrl);
    console.log(product_name);
    //url is sent to the backend
    //const response = await fetch("http://localhost:3000/similar", {
    //    method: "POST",
    //    body: JSON.stringify({ url: currentUrl }),
    //});
    //const data = await response.json();
    const data = [{
        name: "Item 1",
        url: "https://www.google.com",
        image: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
        price: "$100",
        rating: "4.5",
        reviews: "100"
    },{
        name: "Item 2",
        url: "https://www.google.com",
        image: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
        price: "$100",
        rating: "5.5",
        reviews: "100"
    }];
    console.log(data);
    for (const item of data) {
        const item_name = item.name;
        const item_url = item.url;
        const item_image = item.image;
        const item_price = item.price;
        const item_rating = item.rating;
        const item_reviews = item.reviews;
        const new_item = `<div class="item">
            <h3>${item_name}</h3>
            <p>${item_url}</p>
            <img src="${item_image}" alt="${item_name}">
            <p>${item_price}</p>
            <p>${item_rating}</p>
            <p>${item_reviews}</p>
        </div>`;
        similarContainer.innerHTML += new_item;
    }
});