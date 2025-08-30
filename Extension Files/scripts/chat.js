class EcoAIChat {
    constructor() {
        this.backendUrl = 'https://api.ecoai.com/chat'; // Replace with your actual backend URL
        this.chatHistory = [];
        this.isLoading = false;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.chatInput = document.getElementById('chat-input');
        this.chatButton = document.getElementById('chat-button');
        this.chatContainer = document.getElementById('chat-container');
        
        // Create chat container if it doesn't exist
        if (!this.chatContainer) {
            this.createChatContainer();
        }
    }
    
    createChatContainer() {
        // Insert chat container after the input
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-container';
        chatContainer.className = 'chat-container';
        chatContainer.style.cssText = `
            margin-top: 20px;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px;
            background-color: #f9f9f9;
        `;
        
        this.chatButton.parentNode.insertBefore(chatContainer, this.chatButton.nextSibling);
        this.chatContainer = chatContainer;
    }
    
    bindEvents() {
        // Send button click
        this.chatButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key press
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message || this.isLoading) {
            return;
        }
        
        // Add user message to chat
        this.addMessageToChat('user', message);
        
        // Clear input
        this.chatInput.value = '';
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Send message to backend
            const response = await this.sendToBackend(message);
            
            // Add AI response to chat
            this.addMessageToChat('ai', response);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessageToChat('error', 'Sorry, I encountered an error. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async sendToBackend(message) {
        // Get current page information for context
        const pageInfo = await this.getCurrentPageInfo();
        
        const requestData = {
            message: message,
            context: {
                url: pageInfo.url,
                title: pageInfo.title,
                timestamp: new Date().toISOString(),
                chatHistory: this.chatHistory.slice(-5) // Last 5 messages for context
            }
        };
        
        // For demo purposes, you can replace this with your actual backend call
        // Here are a few options:
        
        // Option 1: Real API call to local backend
        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response || data.message;
        } catch (error) {
            console.log('Backend not available, using mock response:', error.message);
            // Fallback to mock response if backend is not available
            return this.getMockResponse(message, pageInfo);
        }
        
        // Option 3: Call your database scraper (if running locally)
        // return this.callLocalScraper(message, pageInfo);
    }
    
    async getCurrentPageInfo() {
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            return {
                url: tab.url,
                title: tab.title
            };
        } catch (error) {
            console.error('Error getting page info:', error);
            return {
                url: 'unknown',
                title: 'Unknown Page'
            };
        }
    }
    
    getMockResponse(message, pageInfo) {
        // Mock responses for testing
        const responses = {
            'sustainable': 'This product appears to have sustainable features! Look for certifications like LEED, Energy Star, or Cradle to Cradle.',
            'eco': 'I can help you find eco-friendly alternatives. Consider looking for products with recycled materials or energy-efficient features.',
            'certification': 'Common sustainability certifications include LEED, Energy Star, Cradle to Cradle, and FSC. These indicate environmental responsibility.',
            'price': 'Sustainable products may cost more initially but often save money in the long run through energy efficiency and durability.',
            'compare': 'I can help you compare products based on sustainability factors. What specific criteria are you looking for?'
        };
        
        // Find matching response
        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        // Default response
        return `I understand you're asking about "${message}". Based on the page you're viewing (${pageInfo.title}), I can help you find sustainable alternatives and provide information about eco-friendly features. What specific aspect would you like to know more about?`;
    }
    
    async callLocalScraper(message, pageInfo) {
        // This would call your database_scrapper.py if it's running as a local server
        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    pageInfo: pageInfo
                })
            });
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error calling local scraper:', error);
            return 'Sorry, the local analysis service is not available.';
        }
    }
    
    addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.style.cssText = `
            margin: 10px 0;
            padding: 10px;
            border-radius: 8px;
            max-width: 80%;
            word-wrap: break-word;
        `;
        
        if (sender === 'user') {
            messageDiv.style.cssText += `
                background-color: #007bff;
                color: white;
                margin-left: auto;
                text-align: right;
            `;
        } else if (sender === 'ai') {
            messageDiv.style.cssText += `
                background-color: #28a745;
                color: white;
                margin-right: auto;
            `;
        } else if (sender === 'error') {
            messageDiv.style.cssText += `
                background-color: #dc3545;
                color: white;
                margin-right: auto;
            `;
        }
        
        messageDiv.textContent = message;
        this.chatContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        
        // Add to history
        this.chatHistory.push({ sender, message, timestamp: new Date().toISOString() });
    }
    
    setLoadingState(loading) {
        this.isLoading = loading;
        this.chatButton.disabled = loading;
        this.chatButton.textContent = loading ? 'Sending...' : 'Send';
        
        if (loading) {
            // Add loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-indicator';
            loadingDiv.className = 'chat-message ai-message';
            loadingDiv.style.cssText = `
                background-color: #6c757d;
                color: white;
                margin-right: auto;
                padding: 10px;
                border-radius: 8px;
                max-width: 80%;
            `;
            loadingDiv.textContent = 'EcoAI is thinking...';
            this.chatContainer.appendChild(loadingDiv);
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        } else {
            // Remove loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
        }
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EcoAIChat();
});
