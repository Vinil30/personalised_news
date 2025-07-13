// NOTE: The backend Python scripts (e.g., chatbot.py) require 'requests' to be installed in the Python environment.
// Global variables
let selectedInterests = [];
let userProfile = {
    name: 'User',
    email: 'user@example.com',
    interests: []
};
// GLOBAL DATA
let newsData = [];
let chatHistory = [];

// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://personalised-news.onrender.com'; // Updated to match your actual Render URL

// Backend API URL (will be updated when backend is deployed)
const MONGODB_API_URL = `${API_BASE_URL}/api`;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Show loading screen
    showLoadingScreen();
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if user has already selected interests
    const savedInterests = localStorage.getItem('userInterests');
    const savedProfile = localStorage.getItem('userProfile');
    
    if (savedInterests && savedProfile) {
        selectedInterests = JSON.parse(savedInterests);
        userProfile = JSON.parse(savedProfile);
        showDashboard();
    } else {
        showWelcomeScreen();
    }
    
    hideLoadingScreen();
}

// Loading screen functions
function showLoadingScreen() {
    document.getElementById('loadingScreen').classList.remove('hidden');
}

function hideLoadingScreen() {
    document.getElementById('loadingScreen').classList.add('hidden');
}

// Welcome screen functions
function showWelcomeScreen() {
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    setupInterestSelection();
}

function setupInterestSelection() {
    const interestItems = document.querySelectorAll('.interest-item');
    const continueBtn = document.getElementById('continueBtn');
    
    interestItems.forEach(item => {
        item.addEventListener('click', function() {
            const interest = this.dataset.interest;
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedInterests = selectedInterests.filter(i => i !== interest);
            } else {
                this.classList.add('selected');
                selectedInterests.push(interest);
            }
            
            // Enable/disable continue button
            continueBtn.disabled = selectedInterests.length === 0;
        });
    });
    
    continueBtn.addEventListener('click', function() {
        if (selectedInterests.length > 0) {
            saveUserInterests();
            showDashboard();
        }
    });
}

function saveUserInterests() {
    userProfile.interests = selectedInterests;
    localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Dashboard functions
function showDashboard() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    setupDashboard();
    loadNewsFeed();
    updateProfileSection();
    setupChatInterface();
}

function setupDashboard() {
    // Setup header buttons
    document.getElementById('refreshBtn').addEventListener('click', loadNewsFeed);
    document.getElementById('settingsBtn').addEventListener('click', showSettingsModal);
    
    // Setup profile section
    document.getElementById('editInterestsBtn').addEventListener('click', showInterestModal);
    document.getElementById('addInterestBtn').addEventListener('click', showInterestModal);
    document.getElementById('viewHistoryBtn').addEventListener('click', viewHistory);
    
    // Setup news filters
    document.getElementById('topicFilter').addEventListener('change', filterNews);
    document.getElementById('sortBtn').addEventListener('click', sortNews);
    
    // Setup modals
    setupModals();
    
    // Setup back button for chatbot
    document.getElementById('backToWebsiteBtn').addEventListener('click', () => {
        document.getElementById('chatInterface').style.display = 'none';
        document.getElementById('websiteInputSection').style.display = 'flex';
        document.getElementById('backToWebsiteBtn').style.display = 'none';
        
        // Clear chat messages
        document.getElementById('chatMessages').innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Hello! I'm your AI assistant. I can help you find news, answer questions, or discuss topics you're interested in. What would you like to know?</p>
                </div>
            </div>
        `;
        
        // Clear chat history and current URL
        chatHistory = [];
        window.currentChatUrl = null;
    });
}

function updateProfileSection() {
    document.getElementById('userName').textContent = userProfile.name;
    document.getElementById('userEmail').textContent = userProfile.email;
    document.getElementById('interestsCount').textContent = selectedInterests.length;
    
    // Update selected interests display
    const selectedInterestsContainer = document.getElementById('selectedInterests');
    selectedInterestsContainer.innerHTML = '';
    
    selectedInterests.forEach(interest => {
        const tag = document.createElement('span');
        tag.className = 'interest-tag';
        tag.textContent = interest;
        selectedInterestsContainer.appendChild(tag);
    });
}

// News feed functions
async function loadNewsFeed() {
    const newsFeed = document.getElementById('newsFeed');
    newsFeed.innerHTML = `
        <div class="loading-posts">
            <div class="loading-spinner"></div>
            <p>Loading your personalized news...</p>
        </div>
    `;
    
    try {
        // Fetch news from MongoDB API based on user interests
        let fetchedNews;
        
        if (selectedInterests.length > 0) {
            const response = await fetch(`${MONGODB_API_URL}/news/interests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ interests: selectedInterests })
            });
            
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error(`Failed to fetch news from API: ${response.status}`);
            }
            
            fetchedNews = await response.json();
        } else {
            // If no interests selected, show all news
            const response = await fetch(`${MONGODB_API_URL}/news`);
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error(`Failed to fetch news from API: ${response.status}`);
            }
            fetchedNews = await response.json();
        }
        
        // If no data from API, fall back to mock data
        if (!fetchedNews || fetchedNews.length === 0) {
            console.log('No data from API, using mock data');
            fetchedNews = await getMockNewsData();
            fetchedNews = fetchedNews.filter(news => 
                selectedInterests.length === 0 || selectedInterests.includes(news.topic)
            );
        }
        
        newsData = fetchedNews;
        displayNewsFeed(newsData);
        updatePostsCount(newsData.length);
        updateTopicFilter(newsData);
        
    } catch (error) {
        console.error('Error loading news:', error);
        // Fall back to mock data on error
        try {
            const mockNewsData = await getMockNewsData();
            const filteredNews = mockNewsData.filter(news => 
                selectedInterests.length === 0 || selectedInterests.includes(news.topic)
            );
            newsData = filteredNews;
            displayNewsFeed(newsData);
            updatePostsCount(newsData.length);
            updateTopicFilter(newsData);
        } catch (mockError) {
            newsFeed.innerHTML = `
                <div class="error-message">
                    <p>Failed to load news. Please try again.</p>
                    <button onclick="loadNewsFeed()" class="retry-btn">Retry</button>
                </div>
            `;
        }
    }
}

async function getMockNewsData() {
    // This simulates your MongoDB news_entries collection
    return [
        {
            _id: '1',
            topic: 'tech',
            title: 'Latest AI Breakthroughs in 2024',
            content: 'Artificial intelligence continues to evolve rapidly with new breakthroughs in machine learning, natural language processing, and computer vision. Researchers are developing more efficient algorithms that require less computational power while delivering better results.',
            image_prompt: 'Generate an image of futuristic AI technology with neural networks and digital interfaces',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRlY2ggSW1hZ2U8L3RleHQ+PC9zdmc+'
        },
        {
            _id: '2',
            topic: 'sports',
            title: 'Championship Finals: Epic Showdown',
            content: 'The championship finals delivered an unforgettable spectacle as the top teams battled it out in a thrilling match that went down to the wire. Fans were treated to exceptional performances and dramatic moments.',
            image_prompt: 'Generate an image of a sports stadium with cheering fans and players in action',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNwb3J0cyBJbWFnZTwvdGV4dD48L3N2Zz4='
        },
        {
            _id: '3',
            topic: 'crypto',
            title: 'Bitcoin Reaches New Heights',
            content: 'Bitcoin has surged to new record levels, driven by increased institutional adoption and growing mainstream acceptance. Analysts predict continued growth as more companies integrate cryptocurrency into their operations.',
            image_prompt: 'Generate an image of Bitcoin cryptocurrency with digital charts and graphs',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNyeXB0byBJbWFnZTwvdGV4dD48L3N2Zz4='
        },
        {
            _id: '4',
            topic: 'health',
            title: 'Breakthrough in Medical Research',
            content: 'Scientists have made a significant breakthrough in medical research, developing new treatments that could revolutionize how we approach certain diseases. The research shows promising results in early clinical trials.',
            image_prompt: 'Generate an image of medical research with scientists in lab coats and medical equipment',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkhlYWx0aCBJbWFnZTwvdGV4dD48L3N2Zz4='
        },
        {
            _id: '5',
            topic: 'space',
            title: 'New Exoplanet Discovery',
            content: 'Astronomers have discovered a new exoplanet that could potentially support life. The planet, located in a distant solar system, has conditions similar to Earth and could be a target for future exploration missions.',
            image_prompt: 'Generate an image of a distant exoplanet with stars and space background',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNwYWNlIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
        }
    ];
}

function displayNewsFeed(news) {
    const newsFeed = document.getElementById('newsFeed');
    
    if (news.length === 0) {
        newsFeed.innerHTML = `
            <div class="no-news">
                <i class="fas fa-newspaper" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3>No news available</h3>
                <p>Try selecting different interests or check back later for updates.</p>
            </div>
        `;
        return;
    }
    
    newsFeed.innerHTML = news.map(post => `
        <div class="news-post" data-topic="${post.topic}">
            <div class="post-header">
                <span class="post-topic">${post.topic}</span>
                <span class="post-time">${getRandomTime()}</span>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-content">${post.content}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image" onerror="this.style.display='none'">` : ''}
            <div class="post-actions">
                <button class="action-button" onclick="likePost('${post._id}')">
                    <i class="fas fa-heart"></i>
                    Like
                </button>
                <button class="action-button" onclick="sharePost('${post._id}')">
                    <i class="fas fa-share"></i>
                    Share
                </button>
                <button class="action-button" onclick="savePost('${post._id}')">
                    <i class="fas fa-bookmark"></i>
                    Save
                </button>
            </div>
        </div>
    `).join('');
}

function getRandomTime() {
    const times = ['2 hours ago', '5 hours ago', '1 day ago', '2 days ago', '1 week ago'];
    return times[Math.floor(Math.random() * times.length)];
}

function updatePostsCount(count) {
    document.getElementById('postsCount').textContent = count;
}

function updateTopicFilter(news) {
    const filter = document.getElementById('topicFilter');
    const topics = [...new Set(news.map(post => post.topic))].sort();
    
    // Clear existing options except "All Topics"
    filter.innerHTML = '<option value="all">All Topics</option>';
    
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic.charAt(0).toUpperCase() + topic.slice(1).replace('-', ' ');
        filter.appendChild(option);
    });
}

function filterNews() {
    const selectedTopic = document.getElementById('topicFilter').value;
    const filteredNews = selectedTopic === 'all' 
        ? newsData 
        : newsData.filter(post => post.topic === selectedTopic);
    
    displayNewsFeed(filteredNews);
}

function sortNews() {
    // Simple sort by title for demo
    const sortedNews = [...newsData].sort((a, b) => a.title.localeCompare(b.title));
    displayNewsFeed(sortedNews);
}

// Chat interface functions
function setupChatInterface() {
    // Website input functionality
    const analyzeBtn = document.getElementById('analyzeWebsiteBtn');
    const websiteInput = document.getElementById('websiteInput');
    const exampleLinks = document.querySelectorAll('.example-link');
    
    analyzeBtn.addEventListener('click', analyzeWebsite);
    websiteInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzeWebsite();
        }
    });
    
    exampleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.dataset.url;
            websiteInput.value = url;
            analyzeWebsite();
        });
    });
    
    // Back button functionality
    const backBtn = document.getElementById('backToWebsiteBtn');
    backBtn.addEventListener('click', function() {
        document.getElementById('websiteInputSection').style.display = 'flex';
        document.getElementById('chatInterface').style.display = 'none';
        this.style.display = 'none';
        
        // Clear chat messages
        document.getElementById('chatMessages').innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Hello! I'm your AI assistant. I can help you find news, answer questions, or discuss topics you're interested in. What would you like to know?</p>
                </div>
            </div>
        `;
        
        // Clear website input
        document.getElementById('websiteInput').value = '';
    });
    
    // Chat functionality
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const suggestion = this.dataset.suggestion;
            chatInput.value = suggestion;
            sendMessage();
        });
    });
}

async function analyzeWebsite() {
    const websiteInput = document.getElementById('websiteInput');
    const url = websiteInput.value.trim();
    
    if (!url) {
        alert('Please enter a valid website URL');
        return;
    }
    
    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }
    
    // Show loading state
    const analyzeBtn = document.getElementById('analyzeWebsiteBtn');
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    analyzeBtn.disabled = true;
    
    try {
        // Call the backend chatbot API
        const response = await fetch(`${API_BASE_URL}/api/chatbot/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Hide website input section and show chat interface
            document.getElementById('websiteInputSection').style.display = 'none';
            document.getElementById('chatInterface').style.display = 'flex';
            
            // Show back button
            document.getElementById('backToWebsiteBtn').style.display = 'flex';
            
            // Store the current URL for chat context
            window.currentChatUrl = url;
            
            // Add initial message about the website
            addMessageToChat(`I've analyzed ${url}. Here's what I found:\n\n${data.message}`, 'bot');
            
            // Add a follow-up message
            addMessageToChat("What would you like to know more about this website?", 'bot');
        } else {
            alert(`Analysis failed: ${data.error}`);
        }
        
    } catch (error) {
        console.error('Error analyzing website:', error);
        alert('Failed to analyze website. Please try again.');
    } finally {
        // Reset button
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
    }
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Check if we have a current URL for context
    if (!window.currentChatUrl) {
        addMessageToChat("Please analyze a website first before asking questions.", 'bot');
        return;
    }
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    chatInput.value = '';
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        // Call the backend chatbot API
        const response = await fetch(`${API_BASE_URL}/api/chatbot/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                url: window.currentChatUrl, 
                message,
                history: chatHistory
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        if (data.success) {
            addMessageToChat(data.message, 'bot');
        } else {
            addMessageToChat(`Sorry, I couldn't process that request: ${data.error}`, 'bot');
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        removeTypingIndicator(typingIndicator);
        addMessageToChat("Sorry, I'm having trouble connecting. Please try again.", 'bot');
    }
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `<p>${message.replace(/\n/g, '<br>')}</p>`;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store in chat history
    chatHistory.push({ sender, message, timestamp: new Date() });
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

function removeTypingIndicator(typingIndicator) {
    if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.parentNode.removeChild(typingIndicator);
    }
}

function generateAIResponse(userMessage) {
    const responses = [
        "That's an interesting question! Let me help you with that.",
        "I can see you're interested in that topic. Here's what I know...",
        "Great question! Based on the latest news, here's what's happening...",
        "I'd be happy to help you with that. Let me search for the most relevant information.",
        "That's a fascinating topic! Here's what I found in the recent news..."
    ];
    
    // Simple keyword-based responses
    if (userMessage.toLowerCase().includes('tech')) {
        return "Technology is evolving rapidly! I can see you have tech interests selected. Would you like me to show you the latest tech news from your feed?";
    } else if (userMessage.toLowerCase().includes('sport')) {
        return "Sports are always exciting! I notice you follow sports news. I can help you find the latest updates and scores.";
    } else if (userMessage.toLowerCase().includes('crypto')) {
        return "Cryptocurrency markets are quite dynamic! I can help you stay updated with the latest crypto news and trends.";
    } else {
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Modal functions
function setupModals() {
    // Interest modal
    document.getElementById('closeModalBtn').addEventListener('click', hideInterestModal);
    document.getElementById('saveInterestsBtn').addEventListener('click', saveInterestsFromModal);
    document.getElementById('cancelInterestsBtn').addEventListener('click', hideInterestModal);
    
    // Settings modal
    document.getElementById('closeSettingsBtn').addEventListener('click', hideSettingsModal);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('cancelSettingsBtn').addEventListener('click', hideSettingsModal);
}

function showInterestModal() {
    const modal = document.getElementById('interestModal');
    const interestsGrid = modal.querySelector('.interests-grid-modal');
    
    // Populate modal with interest items
    interestsGrid.innerHTML = `
        <div class="interest-item" data-interest="geography">
            <i class="fas fa-globe-americas"></i>
            <span>Geography</span>
        </div>
        <div class="interest-item" data-interest="sports">
            <i class="fas fa-futbol"></i>
            <span>Sports</span>
        </div>
        <div class="interest-item" data-interest="space">
            <i class="fas fa-rocket"></i>
            <span>Space</span>
        </div>
        <div class="interest-item" data-interest="gaming">
            <i class="fas fa-gamepad"></i>
            <span>Gaming</span>
        </div>
        <div class="interest-item" data-interest="e-sports">
            <i class="fas fa-trophy"></i>
            <span>E-Sports</span>
        </div>
        <div class="interest-item" data-interest="crypto">
            <i class="fas fa-bitcoin"></i>
            <span>Crypto</span>
        </div>
        <div class="interest-item" data-interest="stocks">
            <i class="fas fa-chart-line"></i>
            <span>Stocks</span>
        </div>
        <div class="interest-item" data-interest="health">
            <i class="fas fa-heartbeat"></i>
            <span>Health</span>
        </div>
        <div class="interest-item" data-interest="fitness">
            <i class="fas fa-dumbbell"></i>
            <span>Fitness</span>
        </div>
        <div class="interest-item" data-interest="weather">
            <i class="fas fa-cloud-sun"></i>
            <span>Weather</span>
        </div>
        <div class="interest-item" data-interest="reality-shows">
            <i class="fas fa-tv"></i>
            <span>Reality Shows</span>
        </div>
        <div class="interest-item" data-interest="start-ups">
            <i class="fas fa-lightbulb"></i>
            <span>Start-ups</span>
        </div>
        <div class="interest-item" data-interest="tech">
            <i class="fas fa-microchip"></i>
            <span>Tech</span>
        </div>
        <div class="interest-item" data-interest="anime">
            <i class="fas fa-dragon"></i>
            <span>Anime</span>
        </div>
        <div class="interest-item" data-interest="celeb">
            <i class="fas fa-star"></i>
            <span>Celebrities</span>
        </div>
        <div class="interest-item" data-interest="meme">
            <i class="fas fa-laugh-squint"></i>
            <span>Memes</span>
        </div>
    `;
    
    // Mark currently selected interests
    const interestItems = interestsGrid.querySelectorAll('.interest-item');
    interestItems.forEach(item => {
        const interest = item.dataset.interest;
        if (selectedInterests.includes(interest)) {
            item.classList.add('selected');
        }
        
        item.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    modal.classList.remove('hidden');
}

function hideInterestModal() {
    document.getElementById('interestModal').classList.add('hidden');
}

function saveInterestsFromModal() {
    const modal = document.getElementById('interestModal');
    const selectedItems = modal.querySelectorAll('.interest-item.selected');
    
    selectedInterests = Array.from(selectedItems).map(item => item.dataset.interest);
    
    saveUserInterests();
    updateProfileSection();
    loadNewsFeed();
    hideInterestModal();
}

function showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    document.getElementById('displayName').value = userProfile.name;
    document.getElementById('userEmailInput').value = userProfile.email;
    modal.classList.remove('hidden');
}

function hideSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettings() {
    const newName = document.getElementById('displayName').value;
    const newEmail = document.getElementById('userEmailInput').value;
    
    userProfile.name = newName;
    userProfile.email = newEmail;
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    updateProfileSection();
    hideSettingsModal();
}

// Utility functions
function viewHistory() {
    alert('View History feature coming soon!');
}

function likePost(postId) {
    alert(`Liked post ${postId}`);
}

function sharePost(postId) {
    alert(`Sharing post ${postId}`);
}

function savePost(postId) {
    alert(`Saved post ${postId}`);
}

// Real MongoDB integration would go here
// For now, this is a placeholder for when you create a backend API
async function fetchFromMongoDB(collection, query = {}) {
    try {
        const response = await fetch(`${MONGODB_API_URL}/${collection}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query)
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching from MongoDB:', error);
        return [];
    }
}

// Export functions for potential backend integration
window.ArenaPulseApp = {
    loadNewsFeed,
    sendMessage,
    updateProfileSection,
    saveUserInterests
}; 