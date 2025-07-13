# ArenaPulse Automated News Generation System

This system automatically generates news posts by scraping various websites, processing content with AI, and saving to MongoDB.

## 🚀 Features

- **Automated Scheduling**: Generates news every 6 hours automatically
- **Manual Trigger**: Generate news on-demand via admin panel or API
- **Multi-source Scraping**: Scrapes 16 different news sources
- **AI Processing**: Uses Groq API for content summarization and image generation
- **MongoDB Storage**: Saves processed news to database
- **Admin Dashboard**: Web interface for monitoring and manual control

## 📁 Files Overview

### Core Files
- `auto_generator.py` - Main automation script with scheduler
- `all_together.py` - News generation logic (your existing file)
- `arena_pulse.py` - AI processing and image generation
- `web_scrapper.py` - Website scraping functionality

### Deployment Files
- `render_deploy.sh` - Render deployment script
- `render.yaml` - Render configuration
- `requirements.txt` - Python dependencies

### Web Interface
- `public/admin.html` - Admin dashboard
- `server.js` - Express server with automation endpoints

## 🔧 Setup Instructions

### 1. Environment Variables
Set these in your Render dashboard:
```
GROQ_API_KEY=your_groq_api_key
MONGO_URL=your_mongodb_connection_string
MONGODB_URI=your_mongodb_connection_string
```

### 2. Dependencies
The system requires both Python and Node.js dependencies:

**Python Dependencies:**
```bash
pip install -r requirements.txt
```

**Node.js Dependencies:**
```bash
npm install
```

### 3. Deployment
1. Push your code to GitHub
2. Connect your repository to Render
3. Set environment variables in Render dashboard
4. Deploy using the `render.yaml` configuration

## 🎯 How It Works

### Automated Flow
1. **Scheduler**: `auto_generator.py` runs every 6 hours
2. **Scraping**: Scrapes 16 different news websites
3. **AI Processing**: Uses Groq API to summarize content and generate images
4. **Storage**: Saves processed news to MongoDB
5. **Logging**: Logs all activities for monitoring

### Manual Trigger
1. **Admin Panel**: Visit `/admin` to use the web interface
2. **API Endpoint**: POST to `/api/generate-news`
3. **Direct Script**: Run `python auto_generator.py --single-run`

## 📊 Admin Dashboard

Access the admin dashboard at: `https://your-app.onrender.com/admin`

**Features:**
- System status monitoring
- Manual news generation trigger
- Real-time activity logs
- Statistics display
- Health checks

## 🔍 Monitoring

### Logs
- Application logs: `auto_generator.log`
- Server logs: Available in Render dashboard
- Admin panel: Real-time activity feed

### Health Checks
- Endpoint: `GET /api/health`
- Returns system status and timestamp

## 🛠️ Troubleshooting

### Common Issues

1. **Python Dependencies Missing**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables Not Set**
   - Check Render dashboard for GROQ_API_KEY and MONGO_URL

3. **MongoDB Connection Issues**
   - Verify connection string format
   - Check network access

4. **API Rate Limits**
   - Groq API has rate limits
   - System includes delays between requests

### Debug Mode
Run with verbose logging:
```bash
python auto_generator.py --debug
```

## 📈 Customization

### Change Generation Interval
Edit `auto_generator.py`:
```python
# Change from 6 hours to 4 hours
schedule.every(4).hours.do(generate_news_posts)
```

### Add New News Sources
Edit `all_together.py`:
```python
links = {
    'your-topic': 'https://your-news-source.com/',
    # ... existing links
}
```

### Modify AI Prompts
Edit `arena_pulse.py` system prompt for different content styles.

## 🔒 Security Considerations

- API keys are stored as environment variables
- No sensitive data in logs
- Rate limiting prevents abuse
- Input validation on all endpoints

## 📞 Support

For issues or questions:
1. Check the logs in Render dashboard
2. Use the admin panel for diagnostics
3. Review this README for common solutions

---

**Note**: This system requires active internet connection and valid API keys to function properly. 