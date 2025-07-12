from arena_pulse import ArenaPulse
from web_scrapper import Website
from dotenv import load_dotenv
from IPython.display import display, Markdown
from PIL import Image
import os
import urllib
import time
# from list import List
import base64
from io import BytesIO
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

class AllTogether:
    
    links = {
        'geography':'https://www.sciencedaily.com/news/earth_climate/geography/',
        'sports': 'https://sports.ndtv.com/',
        'space': 'https://www.space.com/news',
        'gaming':'https://gamerant.com/gaming/',
        'e-sports':'https://esportsinsider.com/latest-news',
        'crypto':'https://www.coindesk.com/',
        'stocks':'https://www.marketwatch.com/',
        'health':'https://www.healthline.com/health-news',
        'fitness':'https://indianexpress.com/section/lifestyle/fitness/',
        'weather':'https://timesofindia.indiatimes.com/topic/weather/news',
        'reality-shows':'https://pagesix.com/tag/reality-tv/',
        'start-ups':'https://indianstartupnews.com/',
        'tech':'https://www.reuters.com/technology/',
        'anime':'https://www.animenewsnetwork.com/news/',
        'movies':'https://screenrant.com/movie-news/',
        'meme':'https://indianexpress.com/about/memes/'
    }
    
    @staticmethod
    def convert_image_to_base64(image, quality=50):
        buffered = BytesIO()
        image = image.convert("RGB")  # JPEG doesn't support transparency
        image.save(buffered, format="JPEG", quality=quality)
        return base64.b64encode(buffered.getvalue()).decode('utf-8')

    
    @staticmethod
    def generating_final(links: dict) -> dict:
        results = []
        for topic, url in links.items():
            print(f"\n🔍 Processing: {topic} => {url}")
            try:
                arena = ArenaPulse(url)
                output = arena.summarize_url(url)
                time.sleep(10)
                image = arena.generate_image(url)
                image_base64 = AllTogether.convert_image_to_base64(image)
                output['image'] = image_base64
                results.append({topic: output})
            except Exception as e:
                print(f"❌ Failed to process {topic} ({url}): {e}")
                
        return results

    @staticmethod
    def save_to_mongo(db_name="news_db", collection_name="news_entries"):
        try:
            news_data = AllTogether.generating_final(AllTogether.links)
        except Exception as e:
            print(e)
            return
        try:
            # Connect to local MongoDB
            mongo_url = os.getenv("MONGO_URL")
            client = MongoClient(mongo_url)
            db = client[db_name]
            collection = db[collection_name]

            # Prepare documents for MongoDB
            for topic_entry in news_data:
                for topic, entry in topic_entry.items():
                    doc = {
                        "topic": topic,
                        "title": entry.get("title", "No Title"),
                        "content": entry.get("content", "No Content"),
                        "image_prompt": entry.get("image_prompt", "No Image Prompt"),
                        "image": entry.get("image", "")
                    }
                    collection.insert_one(doc)

            print(f"✅ Successfully saved {len(news_data)} entries to MongoDB.")
        except Exception as e:
            print(f"❌ MongoDB Error: {e}")
if __name__ == "__main__":
    AllTogether.save_to_mongo()
