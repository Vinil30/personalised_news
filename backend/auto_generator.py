import schedule
import time
import logging
import os
import sys
import argparse
from datetime import datetime
from dotenv import load_dotenv
from all_together import AllTogether

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auto_generator.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def generate_news_posts():
    """
    Main function to generate news posts and save to MongoDB
    """
    try:
        logger.info("🚀 Starting automated news generation...")
        
        # Call the save_to_mongodb function
        AllTogether.save_to_mongodb()
        
        logger.info("✅ News generation completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error during news generation: {str(e)}")
        # Don't raise the exception to prevent the scheduler from stopping

def run_scheduler():
    """
    Run the scheduler with different intervals
    """
    logger.info("📅 Starting news generation scheduler...")
    
    # Schedule news generation every 24 hours
    schedule.every(24).hours.do(generate_news_posts)
    
    # Also run once immediately when started
    logger.info("🔄 Running initial news generation...")
    generate_news_posts()
    
    # Keep the scheduler running
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            logger.info("🛑 Scheduler stopped by user")
            break
        except Exception as e:
            logger.error(f"❌ Scheduler error: {str(e)}")
            time.sleep(300)  # Wait 5 minutes before retrying

def main():
    parser = argparse.ArgumentParser(description='Automated news generation')
    parser.add_argument('--single-run', action='store_true', 
                       help='Run once and exit (for manual triggers)')
    parser.add_argument('--interval', type=int, default=6,
                       help='Interval in hours for scheduled runs (default: 6)')
    
    args = parser.parse_args()
    
    if args.single_run:
        logger.info("🔄 Running single news generation...")
        generate_news_posts()
        logger.info("✅ Single run completed")
    else:
        run_scheduler()

if __name__ == "__main__":
    main() 