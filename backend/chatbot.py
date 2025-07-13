from web_scrapper import Website
from arena_pulse import ArenaPulse
from dotenv import load_dotenv
from groq import Groq
import os
import json
import requests

load_dotenv()

class ChatBot:
    def __init__(self, url, api_key=None, model="llama3-8b-8192"):
        self.url = url
        self.api_key = api_key or os.environ.get("groq_api_key")
        self.model = model
        self.client = Groq(api_key=self.api_key)
        self.website = Website(url)

    def create_system_prompt(self) -> str:
        MAX_CHARS = 20000
        text = self.website.text[:MAX_CHARS] if len(self.website.text) > MAX_CHARS else self.website.text

        return f"""
You are an assistant that analyzes the contents of a website and provides a specific news from the summary provided in 100 words, ignoring text that might be navigation related.
The contents can be about sports, geopolitics, esports, space, etc., so create crisp and engaging titles and summarize accordingly.

STRICT INSTRUCTIONS:
- Do NOT generate content that is violent, explicit (18+), defamatory, hate-inducing, politically biased, or sensitive in nature.
- Avoid making speculative or misleading statements.
- Do not promote conspiracy theories or misinformation.
- Stick strictly to factual summarization based on the given website content.
- Remember to produce news from the summary which belongs to single topic rather than generalising it.
- Do not create your own content, rather go for generating news from the summary provided.
- Give news rather than summary
- If you get user query anything outside this context, just say that this content is not available on the webpage

The content is:
{text}
"""

    def chat(self, history):
        
        system_prompt = self.create_system_prompt()

        full_messages = [{"role": "system", "content": system_prompt}]

        response = self.client.chat.completions.create(
            model=self.model,
            messages=full_messages
        )

        return response.choices[0].message.content
