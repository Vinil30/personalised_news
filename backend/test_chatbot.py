#!/usr/bin/env python3
"""
Test script for ChatBot functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chatbot import ChatBot
import json

def test_chatbot():
    """Test the chatbot with a simple URL"""
    try:
        # Test URL
        test_url = "https://www.reuters.com/technology/"
        
        print(f"Testing ChatBot with URL: {test_url}")
        
        # Create chatbot instance
        chatbot = ChatBot(test_url)
        
        # Test the chat function
        result = chatbot.chat([])
        
        print("✅ ChatBot test successful!")
        print(f"Result: {result}")
        
        # Test JSON serialization
        json_result = json.dumps({'success': True, 'message': result})
        print(f"JSON output: {json_result}")
        
        return True
        
    except Exception as e:
        print(f"❌ ChatBot test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_chatbot()
    if success:
        print("\n ChatBot is working correctly!")
    else:
        print("\n ChatBot has issues that need to be fixed.")
        sys.exit(1) 