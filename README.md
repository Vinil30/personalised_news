# ArenaPulse - Personalized Social Media Application

A modern, AI-powered social media application that aggregates news based on user interests. Built with HTML, CSS, JavaScript, and MongoDB.

## Features

- **Personalized News Feed**: Get news tailored to your interests
- **Interest Selection**: Choose from 16 different topics
- **AI Chat Assistant**: Interactive chat interface for news discussions
- **Modern UI**: Professional, responsive design
- **Real-time Updates**: MongoDB integration for live data
- **User Profiles**: Manage your interests and preferences

## Available Interest Categories

- 🌍 Geography
- ⚽ Sports
- 🚀 Space
- 🎮 Gaming
- 🏆 E-Sports
- ₿ Crypto
- 📈 Stocks
- ❤️ Health
- 💪 Fitness
- 🌤️ Weather
- 📺 Reality Shows
- 💡 Start-ups
- 🔬 Tech
- 🐉 Anime
- ⭐ Celebrities
- 😄 Memes

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI Integration**: Groq API, Hugging Face
- **Styling**: Custom CSS with modern design principles

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Python 3.8+ (for AI components)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social_media_application
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory with your credentials:
   ```env
   MONGODB_URI=mongodb+srv://2023kucp1041:YpFUwc2si0nNBlar@cluster0.evtq3ir.mongodb.net/
   GROQ_API_KEY=your_groq_api_key
   HF_API_KEY=your_huggingface_api_key
   ```

## Running the Application

### Option 1: Full Stack (Recommended)

1. **Start the backend server**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`

2. **Open your browser**
   Navigate to `http://localhost:3000`

### Option 2: Frontend Only (Development)

1. **Open index.html directly**
   - Double-click `index.html` or open it in your browser
   - Note: This will use mock data instead of real MongoDB data

### Option 3: Development Mode

1. **Start with auto-reload**
   ```bash
   npm run dev
   ```

## Usage

### First Time Setup

1. **Welcome Screen**: Select your interests from the available categories
2. **Continue**: Click "Continue to Dashboard" to proceed
3. **Dashboard**: Explore your personalized news feed

### Dashboard Features

#### Left Panel (25%) - Profile Section
- **User Profile**: View and edit your profile information
- **Interests**: See your selected interests and modify them
- **Quick Actions**: Add interests, view history

#### Middle Panel (50%) - News Feed
- **Personalized Content**: News filtered by your interests
- **Topic Filter**: Filter news by specific topics
- **Sort Options**: Sort news by different criteria
- **Interactive Actions**: Like, share, and save posts

#### Right Panel (25%) - AI Chat
- **AI Assistant**: Chat with an AI about news and topics
- **Quick Suggestions**: Pre-defined conversation starters
- **Real-time Responses**: Get instant AI responses

### Managing Interests

1. **Edit Interests**: Click the edit button in the profile section
2. **Add/Remove**: Select or deselect interests in the modal
3. **Save Changes**: Click "Save Changes" to update your feed

### Settings

1. **Access Settings**: Click the gear icon in the header
2. **Profile Settings**: Update your display name and email
3. **Preferences**: Configure auto-refresh and notifications

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/news` - Get all news entries
- `POST /api/news/interests` - Get news by user interests
- `GET /api/topics` - Get all available topics
- `GET /api/news/count` - Get news count by topic
- `POST /api/news/search` - Search news
- `POST /api/users` - Create new user
- `GET /api/users/:email` - Get user by email
- `PUT /api/users/:email/interests` - Update user interests
- `GET /api/health` - Health check

## Database Schema

### news_entries Collection
```javascript
{
  _id: ObjectId,
  topic: String,
  title: String,
  content: String,
  image_prompt: String,
  image: String (base64)
}
```

### users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  interests: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## AI Integration

The application integrates with:
- **Groq API**: For text generation and summarization
- **Hugging Face**: For image generation
- **Custom AI Logic**: For chat responses and content processing

## Customization

### Adding New Interests

1. **Update HTML**: Add new interest items in `index.html`
2. **Update CSS**: Add icons and styling in `styles.css`
3. **Update JavaScript**: Add logic in `script.js`
4. **Update Backend**: Add new topic sources in `all_together.py`

### Styling

The application uses a modern design system with:
- **Color Palette**: Purple gradient theme
- **Typography**: Inter font family
- **Components**: Reusable CSS classes
- **Responsive**: Mobile-first design

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB URI in `.env`
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **API Not Responding**
   - Verify the server is running on port 3000
   - Check CORS settings for local development

3. **No News Loading**
   - Ensure your `all_together.py` script has populated the database
   - Check browser console for API errors

4. **Interest Selection Not Working**
   - Clear browser localStorage
   - Refresh the page

### Debug Mode

Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## Roadmap

- [ ] User authentication and authorization
- [ ] Real-time notifications
- [ ] Advanced AI chat features
- [ ] Social sharing capabilities
- [ ] Mobile app development
- [ ] Analytics dashboard
- [ ] Content moderation
- [ ] Multi-language support

---

**ArenaPulse** - Your personalized news experience powered by AI. 