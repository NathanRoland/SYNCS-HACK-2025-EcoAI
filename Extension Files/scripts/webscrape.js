//title
//description
//price
//category
//url
//average reviews
//import puppeteer from 'puppeteer';

window.WebScraper = class WebScraper {
    async scrapePage(url) {
        try {
            const website = url.split("/")[2];
            if(website == "www.amazon.com.au"){
                return this.amazonScraper(url);
            }
            if(website == "www.ebay.com.au"){
                return this.ebayScraper(url);
            }
            if(website == "www.temu.com"){
                return this.temuScraper(url);
            }
            if(website == "www.aliexpress.com"){
                return this.aliexpressScraper(url);
            }
            if(website == "www.jbhifi.com.au"){
                return this.jbhifiScraper(url);
            }
            if(website == "www.bunnings.com.au"){
                return this.bunningsScraper(url);
            }
            if(website == "www.target.com.au"){
                return this.targetScraper(url);
            }
            if(website == "www.ikea.com"){
                return this.ikeaScraper(url);
            }
            if(website == "www.davidjones.com"){
                return this.davidJonesScraper(url);
            }
            else{
                return this.genericScraper(url);
            }
        } catch (err) {
        console.error("Error fetching URL:", err);
        }
        
    }

    async amazonScraper(url){
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const productName = doc.getElementById("productTitle")?.innerText.trim();
        const description_div = doc.getElementById("feature-bullets");
        const description_elements = Array.from(description_div.getElementsByClassName("a-list-item"));
        const description = description_elements.map(el => (el.textContent || "").trim()).filter(text => text.length > 0).join(" ");
        const priceElements = doc.getElementsByClassName("a-price aok-align-center reinventPricePriceToPayMargin priceToPay")[0];
        const price = priceElements.getElementsByClassName("a-price-whole")[0].textContent.trim() + priceElements.getElementsByClassName("a-price-fraction")[0].textContent.trim();
        const categories = doc.getElementsByClassName("a-link-normal a-color-tertiary");
        let category = "";
        if (categories.length > 0) {
        category = (categories[categories.length - 1].textContent || "").trim();
        }
        const reviews = doc.getElementsByClassName("a-size-base a-color-base")[1]?.innerText.trim()+"/5";
        return {"productName": productName, "description": description, "price": price, "category": category, "reviews": reviews, "url": url};
    }

    async ebayScraper(url){
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const productName = doc.getElementsByClassName("ux-textspans ux-textspans--BOLD")[0]?.innerText.trim();
        const description_div = doc.getElementsByClassName("ux-layout-section-module-evo")[0];
        const description_elements = Array.from(description_div.getElementsByClassName("ux-layout-section-evo__row"));
        let description = "";
        for (const element of description_elements) {
            const span = element.getElementsByTagName("span")[0]?.innerText.trim();
            const p = element.getElementsByTagName("span")[1]?.innerText.trim();
            description += span +": "+ p + ", ";
        }
        const priceElements = doc.getElementsByClassName("x-price-primary")[0];
        const price = priceElements.getElementsByClassName("ux-textspans")[0]?.innerText.trim()
        const categories_container = doc.getElementsByClassName("x-breadcrumb")[0];
        const spans = categories_container.getElementsByTagName("span");
        let category = "";
        if (spans.length > 0) {
        category = (spans[spans.length - 1].textContent || "").trim();
        }
        const reviews = doc.getElementsByClassName("ux-textspans ux-textspans--PSEUDOLINK")[0]?.innerText.trim();
        return {"productName": productName, "description": description, "price": price, "category": category, "reviews": reviews, "url": url};

    }

    async temuScraper(url){
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const productName = doc.getElementsByClassName("_25g_jM0z")[0]?.innerText.trim();
        const despriction_div = doc.getElementsByClassName("B_OB3uj0")[0];
        const description_elements = Array.from(despriction_div.getElementsByClassName("_1YBVObhm"));
        let description = "";
        for (const element of description_elements) {
            description += element.textContent.trim() + ", ";
        }
        const price = doc.getElementsByClassName("_1vkz0rqG PjdWJn3s")[0].getAttribute("aria-label");
        const category_span = doc.getElementsByClassName("_2xXsvHW_ _3YTayS2z")[0];
        const categories = category_span.getElementsByClassName("_2Tl9qLr1");
        let category = "";
        if (categories.length > 0) {
            category = (categories[categories.length - 1].textContent || "").trim();
        }
        const reviews = doc.getElementsByClassName("_377jlZDR")[0]?.innerText.trim()+"/5";
        return {"productName": productName, "description": description, "price": price, "category": category, "reviews": reviews, "url": url};
    }

    async jbhifiScraper(url){
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const productNameElement = doc.getElementsByClassName("_12mtftw9")[0];
        //const productName = productNameElement ? productNameElement.textContent.trim() : "";
        const productName = url.split("/")[4];
        console.log(productName);

        let description = "";
        const product_info_div = doc.getElementById("pdp-kf-list-container");
        if (product_info_div) {
            const list_items = product_info_div.getElementsByTagName("li");
            for (const li of list_items) {
                description += (li.textContent || "").trim() + ", ";
            }
        }

        const description_div = doc.getElementsByClassName("_1bkzdz98 _1bkzdz99")[0];
        if (description_div) {
            const description_elements = Array.from(description_div.getElementsByTagName("p"));
            for (const element of description_elements) {
                description += (element.textContent || "").trim() + ", ";
            }
        }
        console.log(description);

        const priceElement = doc.getElementsByClassName("PriceFont_fontStyle__w0cm2q1 PriceTag_actual__1eb7mu91a PriceTag_actual_variant_default__1eb7mu91b")[0];
        const price = priceElement ? priceElement.textContent.trim() : "";
        console.log(price);

        let category = "";
        const category_span = doc.getElementsByClassName("breadcrumbnav")[0];
        if (category_span) {
            const list_elements = Array.from(category_span.getElementsByTagName("li"));
            if (list_elements.length > 1) {
                category = (list_elements[list_elements.length - 2].textContent || "").trim();
            }
        }
        console.log(category);

        const reviewsElement = doc.getElementsByClassName("bv_avgRating_component_container notranslate")[0];
        const reviews = reviewsElement ? (reviewsElement.textContent.trim() + "/5") : "N/A";
        console.log(reviews);

        return {productName, description, price, category, reviews, url};

    }

    async bunningsScraper(url){
        console.log("scraping bunnings");
    }
    
    async targetScraper(url){
        console.log("scraping target");
    }

    async ikeaScraper(url){
        console.log("scraping ikea");
    }
    
    async davidJonesScraper(url){
        console.log("scraping david jones");
    }

    async harveynormanScraper(url){
        console.log("scraping harveynorman");
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        
    }

    async genericScraper(url){
        console.log("scraping generic");
    }

}
//amazon
//ebay
//temu
//aliexpress
//jbhifi
//bunnings
//target
//ikea
//david jones
