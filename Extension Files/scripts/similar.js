console.log("similar.js");

async function getAmazonImage(productUrl) {
    const response = await fetch(productUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const imageElement = doc.getElementById("landingImage") || 
                        doc.querySelector("#imgBlkFront") || 
                        doc.querySelector(".a-dynamic-image") ||
                        doc.querySelector("#main-image");
    if (imageElement) {
        return imageElement.getAttribute("src") || 
                imageElement.getAttribute("data-old-hires") ||
                imageElement.getAttribute("data-a-dynamic-image");
    }
    return null;
}

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
    similarContainer.innerHTML = "Currently processing your request...";

    async function getCurrentUrl() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url;
    }
    const currentUrl = await getCurrentUrl();
    console.log(currentUrl);
    //webScraper.scrapePage(currentUrl)
    const productData = await webScraper.scrapePage(currentUrl);
    console.log(productData);

    similarContainer.innerHTML = "Loading...";
    
    const response = await fetch("http://localhost:8000/api/recommend", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
        
    const result = await response.json();
    console.log("Backend response:", result);
    const data = result.message;
    console.log(data);
    const alternateProducts_WHOLE = data.alternatives;
    let alternateProducts = alternateProducts_WHOLE.split("\n");
    alternateProducts = alternateProducts.filter(item => item !== "");
    if (!(alternateProducts[0].includes("**"))) {
        //remove the first element if it doesn't include "**"
        alternateProducts.shift();
    }
    console.log("Split products:", alternateProducts);
    if (alternateProducts.length === 0) {
        similarContainer.innerHTML = "";
        similarContainer.innerHTML += `<p>No similar products found at the moment</p>`;
        return;
    }
    similarContainer.innerHTML = "";
    similarContainer.innerHTML += `<h2>Similar Products</h2>`;
    
    for (let i = 0; i < 3; i++) {
        const product = alternateProducts[i];
        const trimmedProduct = product;
        let product_name = trimmedProduct.split("** ")[0];
        if (product_name.includes("**")) {
            product_name = product_name.slice(2);
        }
        if (product_name.includes("**")) {
            product_name = product_name.slice(2);
        }
        const product_info = trimmedProduct.split("** ")[1];
        let elements = product_info.split("- ");
        elements = elements.filter(item => item !== "");

        console.log("Elements:", elements);
        const product_url_whole = elements[2];
        let product_url;
        if(product_url_whole.includes("(")) {
            const product_url_1 = product_url_whole.split("(")[1];
            console.log("Product url 1:", product_url_1);
            product_url = product_url_1.split(")")[0];
        } else {
            product_url = product_url_whole;
        }
        
        const productImage = await getAmazonImage(product_url);
        const imageHtml = productImage ? `<img src="${productImage}" alt="${product_name}" style="max-width: 200px; height: auto; margin: 10px 0;">` : '';
        
        const new_item = `<div class="item">
            <h3>${product_name}</h3>
            ${imageHtml}
            <p>${elements[0]}</p>
            <p>${elements[1]}</p>
            <a href="${product_url}" target="_blank">View Product</a>
        </div>
        <hr>`;
        similarContainer.innerHTML += new_item;
    }
    if(alternateProducts.length > 3) {
        similarContainer.innerHTML += `<p>${alternateProducts[3]}</p>`;
    }
});