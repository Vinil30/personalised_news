#!/usr/bin/env python3
"""
Test script for ArenaPulse automation system
"""

import os
import sys
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment():
    """Test if all required environment variables are set"""
    print("🔍 Testing environment variables...")
    
    required_vars = ['GROQ_API_KEY', 'MONGO_URL']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {missing_vars}")
        return False
    else:
        print("✅ All environment variables are set")
        return True

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing module imports...")
    
    try:
        import schedule
        print("✅ schedule module imported")
    except ImportError:
        print("❌ schedule module not found. Run: pip install schedule")
        return False
    
    try:
        from all_together import AllTogether
        print("✅ AllTogether class imported")
    except ImportError as e:
        print(f"❌ Failed to import AllTogether: {e}")
        return False
    
    try:
        from arena_pulse import ArenaPulse
        print("✅ ArenaPulse class imported")
    except ImportError as e:
        print(f"❌ Failed to import ArenaPulse: {e}")
        return False
    
    return True

def test_mongodb_connection():
    """Test MongoDB connection"""
    print("🔍 Testing MongoDB connection...")
    
    try:
        from pymongo import MongoClient
        mongo_url = os.getenv("MONGO_URL")
        client = MongoClient(mongo_url)
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

def test_groq_api():
    """Test Groq API connection"""
    print("🔍 Testing Groq API...")
    
    try:
        from groq import Groq
        api_key = os.getenv("GROQ_API_KEY")
        client = Groq(api_key=api_key)
        
        # Simple test request
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        
        print("✅ Groq API connection successful")
        return True
    except Exception as e:
        print(f"❌ Groq API connection failed: {e}")
        return False

def test_single_news_generation():
    """Test generating a single news item"""
    print("🔍 Testing single news generation...")
    
    try:
        from all_together import AllTogether
        
        # Test with just one link to avoid rate limits
        test_links = {'test': 'https://www.reuters.com/technology/'}
        
        print("⏳ Generating test news (this may take a minute)...")
        results = AllTogether.generating_final(test_links)
        
        if results and len(results) > 0:
            print("✅ News generation successful")
            return True
        else:
            print("❌ News generation returned no results")
            return False
            
    except Exception as e:
        print(f"❌ News generation failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting ArenaPulse automation tests...\n")
    
    tests = [
        ("Environment Variables", test_environment),
        ("Module Imports", test_imports),
        ("MongoDB Connection", test_mongodb_connection),
        ("Groq API Connection", test_groq_api),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"Running: {test_name}")
        print('='*50)
        
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print(f"\n{'='*50}")
    print(f"Test Results: {passed}/{total} tests passed")
    print('='*50)
    
    if passed == total:
        print("🎉 All tests passed! Your automation system is ready.")
        print("\nNext steps:")
        print("1. Deploy to Render")
        print("2. Set environment variables in Render dashboard")
        print("3. Access admin panel at: https://your-app.onrender.com/admin")
    else:
        print("⚠️  Some tests failed. Please fix the issues before deploying.")
        sys.exit(1)

if __name__ == "__main__":
    main() 