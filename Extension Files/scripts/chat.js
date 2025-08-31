console.log("chat.js");

const chatButton = document.getElementById('chat-button');
const chatInput = document.getElementById('chat-input');
const resetChatButton = document.getElementById('reset-chat-button');

chatButton.addEventListener('click', async () => {
    const product = chatInput.value;
    const chatPrompt = document.getElementById("chat-prompt");
    chatPrompt.innerHTML = "Loading..."
    console.log(product);
    //this will be sent to the backend and response will be displayed in the chat container
    const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: product })
    });

    const result = await response.json();

    console.log("Chat response:", result)
    chatPrompt.innerHTML = "Prompt: " + product;
    const chatContainer = document.getElementById("chat-container");
    const products = result.products;
    chatContainer.innerHTML = "";
    for (let i = 0; i< products.length; i++) {
        const single_product = products[i];
        //{title: 'Eco Essentials Starter Kit - 5 items for 10% discount', price: '8.78', site: 'Little Eco Shop', similarity: 0.7926472857756323}
        const title = single_product.title;
        const price = single_product.price;
        const site = single_product.site;
        const similarity = single_product.similarity;
        const new_item=`<div class="item">
            <h3>${title}</h3>
            <p>Price: $${price}</p>
            <p>Store: ${site}</p>
            <p>Match: ${(similarity * 100).toFixed(1)}%</p>
        </div>
        <hr>`;
        console.log(new_item)
        chatContainer.innerHTML += new_item;
    }
});

resetChatButton.addEventListener('click', () => {
    const chatPrompt = document.getElementById("chat-prompt");
    chatPrompt.innerHTML = "";
    const chatContainer = document.getElementById("chat-container");
    chatContainer.innerHTML = "";
});

