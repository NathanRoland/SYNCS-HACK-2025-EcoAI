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
            if(website == "www.jbhifi.com.au"){
                return this.jbhifiScraper(url);
            }
            if(website == "www.bunnings.com.au"){
                return this.bunningsScraper(url);
            }
            if(website == "www.binglee.com.au"){
                return this.BingLeeScraper(url);
            }
            if(website == "www.ikea.com"){
                return this.ikeaScraper(url);
            }
            if(website == "www.mitre10.com.au"){
                return this.Mitre10Scraper(url);
            }
            if(website == "www.harveynorman.com.au"){
                return this.harveynormanScraper(url);
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

    //update certain descriptions
    async jbhifiScraper(url){
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const productNameElement = doc.getElementsByClassName("_12mtftw9")[0];
        //const productName = productNameElement ? productNameElement.textContent.trim() : "";
        const productName = url.split("/")[4];

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

        const priceElement = doc.getElementsByClassName("PriceFont_fontStyle__w0cm2q1 PriceTag_actual__1eb7mu91a PriceTag_actual_variant_default__1eb7mu91b")[0];
        const price = priceElement ? priceElement.textContent.trim() : "";

        let category = "";
        const category_span = doc.getElementsByClassName("breadcrumbnav")[0];
        if (category_span) {
            const list_elements = Array.from(category_span.getElementsByTagName("li"));
            if (list_elements.length > 1) {
                category = (list_elements[list_elements.length - 2].textContent || "").trim();
            }
        }

        const reviewsElement = doc.getElementsByClassName("bv_avgRating_component_container notranslate")[0];
        const reviews = reviewsElement ? (reviewsElement.textContent.trim() + "/5") : "N/A";

        return {"productName": productName, "description": description, "price": price, "category": category, "reviews": reviews, "url": url};
    }

    //update category and description
    async bunningsScraper(url){
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const productName = doc.getElementsByClassName("MuiTypography-root sc-500f213-2 gbAyqy MuiTypography-h1")[0]?.innerText.trim();

        let description = doc.getElementsByClassName("font-body pb-6 lg:pt-4")[0]?.innerText.trim();
        const button = document.getElementById("radix-13");
        if (button) button.click();
        setTimeout(() => {
            description += " Sustainability: " + document.querySelector(".flex items-start gap-x-3")?.textContent.trim() || "";
        }, 500);

        const price = doc.getElementsByClassName("sc-bbcf7fe4-3 kAMCuk")[0]?.innerText.trim();
        const category = productName
        const reviews = doc.getElementsByClassName("ml-[0.3125rem] text-xs leading-8 tracking-[0.0125rem] text-grey-charcoal")[0]?.innerText.trim() + "/5";
        return {"productName": productName, "description": description, "price": price, "category": category, "reviews": reviews, "url": url};
    }
    
    async BingLeeScraper(url){
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const productName = doc.getElementsByClassName("text-blue heading mt-2 break-words text-left text-2xl lg:text-3xl")[0]?.innerText.trim();
        const description = doc.getElementsByClassName("border-gray-lighter bg-gray-lightest flex w-full flex-col gap-8 px-8 py-12 md:w-1/3 md:border-l md:p-16")[0]?.innerText.trim();
        const price = doc.getElementsByClassName("heading text-blue text-5xl")[0]?.innerText.trim();
        const category_div = doc.getElementsByClassName("text-gray font-bold");
        let category = "";
        if (category_div.length > 0) {
            category = (category_div[category_div.length - 3].textContent || "").trim();
        }
        const reviews = doc.getElementsByClassName("bv-rnr__sc-157rd1w-1 bSVVzx")[0]?.innerText.trim() + "/5";
        return {"productName": productName, "description": description, "price": price, "category": category, "reviews": reviews, "url": url};
    }

    //add description live events
    async ikeaScraper(url){
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const productName = doc.getElementsByClassName("pip-price-module__name-decorator notranslate")[0]?.innerText.trim() + doc.getElementsByClassName("pip-price-module__description")[0]?.innerText.trim();
        const description = productName;
        const price = doc.getElementsByClassName("pip-price__integer")[0]?.innerText.trim();        
        const category_div = doc.getElementsByClassName("hnf-breadcrumb__link hnf-link hnf-link--black");
        let category = "";
        if (category_div.length > 0) {
            category = (category_div[category_div.length - 1].textContent || "").trim();
        }        
        const reviews = doc.getElementsByClassName("pip-highlight-reviews__header")[0]?.innerText.trim() + "/5";
        return {"productName": productName, "description": description, "price": price, "category": category, "reviews": reviews, "url": url};
    }
    
    async Mitre10Scraper(url){
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        const productName = doc.getElementsByClassName("page-title-wrapper product")[0].getElementsByTagName("span")[0].textContent.trim();
        const description = doc.getElementsByClassName("data item attribute-block")[0]?.innerText.trim();
        const price = doc.getElementsByClassName("integer")[0]?.innerText.trim();
        const category_div = doc.getElementsByClassName("items")[0];
        const categories_list = category_div.getElementsByTagName("a");
        let category = "";
        if (categories_list.length > 0) {
            category = (categories_list[categories_list.length - 1].textContent || "").trim();
        }
        const reviews = doc.getElementsByClassName("bv-rnr__sc-157rd1w-1 emgkGJ")[0]?.innerText.trim() + "/5";
        console.log({productName, description, price, category, reviews, url});
        return {"productName": productName, "description": description, "price": price, "category": category, "reviews": reviews, "url": url};
    }

    async harveynormanScraper(url){
        console.log("scraping harveynorman");
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        const productName = doc.getElementsByClassName("GelBrickProductPage_sf-page-product__product-title__SfDB6")[0].getElementsByTagName("h1")[0].textContent.trim();
        const description_div = doc.getElementsByClassName("ProductPageDescription_sf-product-page-description__UMUSi sf-cms-content-legacy")[0];
        const description = description_div.getElementsByClassName("sf-decode-rich-content")[0].textContent.trim();
        const price = doc.getElementsByClassName("PriceCard_sf-price-card__price__xQHV2")[0].textContent.trim();
        const category_span = doc.getElementsByClassName("GelBrickPageBreadcrumbs_sf-page-breadcrumbs__links__gogjq")[0];
        const categories = category_span.getElementsByTagName("span");
        let category = "";
        if (categories.length > 0) {
            category = (categories[categories.length - 1].textContent || "").trim();
        }

        const reviews = "Null/5";
        console.log({productName, description, price, category, reviews, url});
        return {"productName": productName, "description": description, "price": price, "category": category, "reviews": reviews, "url": url};

    }

    async genericScraper(url){
        console.log("scraping generic");
        const names = url.split("/");
        const name = names[names.length - 1];
        return {"productName": name, "url": url};
    }

}
