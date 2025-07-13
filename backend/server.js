// NOTE: The Python scripts called by this server (e.g., chatbot.py) require 'requests' to be installed in the Python environment.
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const { ObjectId } = require('mongodb'); // Added for serving images

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://personalised-news.onrender.com', 'https://your-render-app.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://2023kucp1041:YpFUwc2si0nNBlar@cluster0.evtq3ir.mongodb.net/";
const DB_NAME = "news_db";

let db;

async function connectToMongoDB() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// API Routes

// Serve favicon
app.get('/favicon.ico', (req, res) => {
    res.redirect('/favicon.svg');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'ArenaPulse API is running'
    });
});

// Manual trigger for news generation
app.post('/api/generate-news', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        console.log('🔄 Manual news generation triggered...');
        
        // Run the Python script using the virtual environment Python
        const pythonPath = '../venv/Scripts/python.exe';
        const { stdout, stderr } = await execAsync(`"${pythonPath}" auto_generator.py --single-run`);
        
        if (stderr) {
            console.error('Python script stderr:', stderr);
        }
        
        console.log('✅ News generation completed');
        res.json({ 
            success: true, 
            message: 'News generation completed successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error triggering news generation:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate news',
            message: error.message
        });
    }
});

// Admin panel route
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html');
});

// Chatbot endpoint
app.post('/api/chatbot/analyze', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        // Import the ChatBot class
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        console.log(`🤖 Analyzing website: ${url}`);
        
        // Create a temporary Python script to avoid command line issues
        const pythonScript = `
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from chatbot import ChatBot
    
    chatbot = ChatBot('${url}')
    result = chatbot.chat([])
    print("SUCCESS:" + result)
except Exception as e:
    print("ERROR:" + str(e))
`;
        
        // Write the script to a temporary file
        const fs = require('fs');
        const tempScriptPath = './temp_chatbot_script.py';
        fs.writeFileSync(tempScriptPath, pythonScript);
        
        // Run the Python script using the virtual environment Python
        const pythonPath = '../venv/Scripts/python.exe';
        const { stdout, stderr } = await execAsync(`"${pythonPath}" "${tempScriptPath}"`);
        
        // Clean up the temporary file
        fs.unlinkSync(tempScriptPath);
        
        if (stderr) {
            console.error('Chatbot stderr:', stderr);
        }
        
        console.log('Python output:', stdout);
        
        if (!stdout || stdout.trim() === '') {
            throw new Error('No output from Python script');
        }
        
        const output = stdout.trim();
        
        if (output.startsWith('SUCCESS:')) {
            const message = output.substring(8); // Remove "SUCCESS:" prefix
            res.json({
                success: true,
                message: message,
                url: url
            });
        } else if (output.startsWith('ERROR:')) {
            const error = output.substring(6); // Remove "ERROR:" prefix
            res.status(500).json({
                success: false,
                error: error
            });
        } else {
            throw new Error('Unexpected output format from Python script');
        }
        
    } catch (error) {
        console.error('❌ Chatbot error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze website',
            message: error.message
        });
    }
});

// Chatbot chat endpoint
app.post('/api/chatbot/chat', async (req, res) => {
    try {
        const { url, message, history } = req.body;
        
        if (!url || !message) {
            return res.status(400).json({ error: 'URL and message are required' });
        }
        
        // Import the ChatBot class
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        console.log(`💬 Chat message for ${url}: ${message}`);
        
        // Create a temporary Python script for chat
        const pythonScript = `
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from chatbot import ChatBot
    
    chatbot = ChatBot('${url}')
    result = chatbot.chat(${JSON.stringify(history || [])})
    print("SUCCESS:" + result)
except Exception as e:
    print("ERROR:" + str(e))
`;
        
        // Write the script to a temporary file
        const fs = require('fs');
        const tempScriptPath = './temp_chatbot_chat_script.py';
        fs.writeFileSync(tempScriptPath, pythonScript);
        
        // Run the Python script using the virtual environment Python
        const pythonPath = '../venv/Scripts/python.exe';
        const { stdout, stderr } = await execAsync(`"${pythonPath}" "${tempScriptPath}"`);
        
        // Clean up the temporary file
        fs.unlinkSync(tempScriptPath);
        
        if (stderr) {
            console.error('Chatbot stderr:', stderr);
        }
        
        console.log('Python chat output:', stdout);
        
        if (!stdout || stdout.trim() === '') {
            throw new Error('No output from Python script');
        }
        
        const output = stdout.trim();
        
        if (output.startsWith('SUCCESS:')) {
            const message = output.substring(8); // Remove "SUCCESS:" prefix
            res.json({
                success: true,
                message: message,
                url: url
            });
        } else if (output.startsWith('ERROR:')) {
            const error = output.substring(6); // Remove "ERROR:" prefix
            res.status(500).json({
                success: false,
                error: error
            });
        } else {
            throw new Error('Unexpected output format from Python script');
        }
        
    } catch (error) {
        console.error('❌ Chatbot chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat message',
            message: error.message
        });
    }
});

// Serve base64 images as actual image files
app.get('/api/image/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const collection = db.collection('news_entries');
        
        const newsItem = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!newsItem || !newsItem.image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(newsItem.image, 'base64');
        
        // Set appropriate headers
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', imageBuffer.length);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ error: 'Failed to serve image' });
    }
});

// Get news entries
app.get('/api/news', async (req, res) => {
    try {
        const { topic, limit = 20 } = req.query;
        const collection = db.collection('news_entries');
        
        let query = {};
        if (topic && topic !== 'all') {
            query.topic = topic;
        }
        
        const news = await collection.find(query)
            .limit(parseInt(limit))
            .sort({ _id: -1 }) // Sort by newest first
            .toArray();
        
        // Add image URLs to each news item
        const newsWithImageUrls = news.map(item => ({
            ...item,
            imageUrl: item.image ? `/api/image/${item._id}` : null
        }));
        
        res.json(newsWithImageUrls);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Get news by user interests
app.post('/api/news/interests', async (req, res) => {
    try {
        const { interests } = req.body;
        const collection = db.collection('news_entries');
        
        if (!interests || interests.length === 0) {
            return res.json([]);
        }
        
        const query = { topic: { $in: interests } };
        const news = await collection.find(query)
            .limit(20)
            .sort({ _id: -1 })
            .toArray();
        
        // Add image URLs to each news item
        const newsWithImageUrls = news.map(item => ({
            ...item,
            imageUrl: item.image ? `/api/image/${item._id}` : null
        }));
        
        res.json(newsWithImageUrls);
    } catch (error) {
        console.error('Error fetching news by interests:', error);
        res.status(500).json({ error: 'Failed to fetch news by interests' });
    }
});

// Get all available topics
app.get('/api/topics', async (req, res) => {
    try {
        const collection = db.collection('news_entries');
        const topics = await collection.distinct('topic');
        res.json(topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Get news count by topic
app.get('/api/news/count', async (req, res) => {
    try {
        const collection = db.collection('news_entries');
        const pipeline = [
            {
                $group: {
                    _id: '$topic',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ];
        
        const counts = await collection.aggregate(pipeline).toArray();
        res.json(counts);
    } catch (error) {
        console.error('Error fetching news count:', error);
        res.status(500).json({ error: 'Failed to fetch news count' });
    }
});

// Search news
app.post('/api/news/search', async (req, res) => {
    try {
        const { query, topic } = req.body;
        const collection = db.collection('news_entries');
        
        let searchQuery = {};
        
        if (query) {
            searchQuery.$text = { $search: query };
        }
        
        if (topic && topic !== 'all') {
            searchQuery.topic = topic;
        }
        
        const news = await collection.find(searchQuery)
            .limit(20)
            .sort({ _id: -1 })
            .toArray();
        
        // Add image URLs to each news item
        const newsWithImageUrls = news.map(item => ({
            ...item,
            imageUrl: item.image ? `/api/image/${item._id}` : null
        }));
        
        res.json(newsWithImageUrls);
    } catch (error) {
        console.error('Error searching news:', error);
        res.status(500).json({ error: 'Failed to search news' });
    }
});

// User management routes
app.post('/api/users', async (req, res) => {
    try {
        const { email, password, interests } = req.body;
        const collection = db.collection('users');
        
        // Check if user already exists
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Create new user
        const newUser = {
            email,
            password, // In production, hash this password
            interests: interests || [],
            createdAt: new Date()
        };
        
        const result = await collection.insertOne(newUser);
        res.json({ 
            success: true, 
            userId: result.insertedId,
            message: 'User created successfully' 
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.get('/api/users/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const collection = db.collection('users');
        
        const user = await collection.findOne({ email }, { projection: { password: 0 } });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.put('/api/users/:email/interests', async (req, res) => {
    try {
        const { email } = req.params;
        const { interests } = req.body;
        const collection = db.collection('users');
        
        const result = await collection.updateOne(
            { email },
            { $set: { interests, updatedAt: new Date() } }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ 
            success: true, 
            message: 'Interests updated successfully' 
        });
    } catch (error) {
        console.error('Error updating user interests:', error);
        res.status(500).json({ error: 'Failed to update interests' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: db ? 'Connected' : 'Disconnected'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
    await connectToMongoDB();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 API available at http://localhost:${PORT}/api`);
        console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
}); 