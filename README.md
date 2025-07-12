# Arena Pulse - Social Media Application

A modern social media application with AI-powered news aggregation and personalized content delivery.

## 🏗️ Project Structure

```
social_media_application/
├── public/                    # Frontend files (Firebase Hosting)
│   ├── index.html            # Main application page
│   ├── styles.css            # Styling and animations
│   └── script.js             # Frontend JavaScript logic
├── backend/                   # Backend files (Render/Heroku)
│   ├── server.js             # Express.js server
│   ├── package.json          # Node.js dependencies
│   ├── all_together.py       # Main AI news generation script
│   ├── arena_pulse.py        # News summarization module
│   ├── image_generator.py    # AI image generation
│   ├── web_scrapper.py       # Web scraping utilities
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment variables
│   ├── venv/                 # Python virtual environment
│   ├── env/                  # Additional environment files
│   ├── demo.ipynb            # Jupyter notebook for testing
│   ├── start.bat             # Windows startup script
│   └── start.ps1             # PowerShell startup script
├── firebase.json             # Firebase Hosting configuration
├── .firebaserc              # Firebase project configuration
└── README.md                # This file
```

## 🚀 Deployment

### Frontend (Firebase Hosting)
- **URL**: https://personalisednews.web.app
- **Status**: ✅ Deployed
- **Files**: `public/` directory

### Backend (Render/Heroku)
- **Status**: ⏳ Ready for deployment
- **Files**: `backend/` directory
- **API**: Will provide endpoints for frontend

## 🛠️ Local Development

### Frontend Development
```bash
# Navigate to project root
cd social_media_application

# Deploy to Firebase (after making changes)
firebase deploy --only hosting
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Start the server
npm start

# The server will run on http://localhost:3000
```

## 🔧 Configuration

### Environment Variables (backend/.env)
```
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
# Add other required environment variables
```

### API Configuration
- **Local**: `http://localhost:3000/api`
- **Production**: `https://your-render-app.onrender.com/api`

## 📱 Features

### Frontend
- ✅ Modern, responsive UI with glassmorphism design
- ✅ Interest-based content filtering
- ✅ Real-time news feed
- ✅ AI chat interface
- ✅ User profile management
- ✅ Topic-based filtering and sorting

### Backend
- ✅ MongoDB integration for news storage
- ✅ AI-powered news summarization
- ✅ Image generation with AI
- ✅ Web scraping for news sources
- ✅ RESTful API endpoints
- ✅ User interest management

## 🔄 API Endpoints

- `GET /api/news` - Get all news
- `GET /api/news?topic=tech` - Get news by topic
- `POST /api/news/interests` - Get news by user interests
- `POST /api/news/search` - Search news
- `GET /api/image/:id` - Get news image
- `GET /api/health` - Health check

## 🎯 Next Steps

1. **Deploy Backend to Render**:
   - Push `backend/` directory to GitHub
   - Connect to Render
   - Set environment variables
   - Deploy

2. **Update Frontend API URL**:
   - Replace `https://your-render-app.onrender.com` with actual Render URL
   - Redeploy frontend

3. **Test Integration**:
   - Verify API calls work
   - Test news loading
   - Test image display

## 📝 Notes

- Frontend is deployed and accessible at https://personalisednews.web.app
- Backend needs to be deployed separately on Render/Heroku
- All Python AI scripts are preserved in the backend directory
- MongoDB connection and environment variables are maintained
- Automatic deployment is set up for frontend via Firebase

## 🆘 Troubleshooting

### Firebase Deployment Issues
- Ensure only frontend files are in `public/` directory
- Check that no executable files are being uploaded
- Verify `firebase.json` configuration

### Backend Issues
- Check MongoDB connection string
- Verify all environment variables are set
- Ensure Python dependencies are installed

### API Connection Issues
- Verify backend URL is correct in frontend
- Check CORS settings on backend
- Ensure backend is running and accessible 