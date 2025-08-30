console.log("chat.js");

const chatButton = document.getElementById('chat-button');
const chatInput = document.getElementById('chat-input');

chatButton.addEventListener('click', () => {
    const product = chatInput.value;
    console.log(product);
    //this will be sent to the backend and response will be displayed in the chat container
    const response = ("Response:this is a test response");
    const chatPrompt = document.getElementById("chat-prompt");
    chatPrompt.innerHTML = product;
    console.log(response);
    //display the response in the chat container
    const chatContainer = document.getElementById("chat-container");
    chatContainer.innerHTML = response;
    
});