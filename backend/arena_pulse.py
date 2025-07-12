import os

import urllib
from dotenv import load_dotenv
from groq import Groq
from web_scrapper import Website
from image_generator import ImageforArenaPulse
from PIL import Image
import json

load_dotenv()

class ArenaPulse:
    def __init__(self,url, api_key=None, model="llama3-70b-8192"):
        self.api_key = api_key or os.environ.get("groq_api_key")
        if not self.api_key:
            raise ValueError("GROQ API key not found in environment variables.")
        self.client = Groq(api_key=self.api_key)
        self.model = model
        self.url = url
        self.system_prompt = """
You are an assistant that analyzes the contents of a website and provides a specific news from the summary provided in 100 words, ignoring text that might be navigation related.
The contents can be about sports, geopolitics, esports, space, etc., so create crisp and engaging titles and summarize accordingly.

STRICT INSTRUCTIONS:
- Do NOT generate content that is violent, explicit (18+), defamatory, hate-inducing, politically biased, or sensitive in nature.
- Avoid making speculative or misleading statements.
- Do not promote conspiracy theories or misinformation.
- Do not include any personally identifiable information from scraped content.
- Stick strictly to factual summarization based on the given website content.
- Your response should not include personal opinions or emotional tone.
- Generate responses that are safe, respectful, and appropriate for all audiences.
- Remember to produce news from the summary which belongs to single topic rather than generalising it.
- Do not create your own content, rather go for generating news from the summary provided.
- Give news rather than summary
Respond in the json format, the text should be such that there are no headings, headlines and title , it should be pure description type,
generate relevant image prompt so that a LLM can generate image using that prompt which is relevant to the summary
Respond in the following JSON format by assigning to an `output` variable:

output = {
    "title": "Tensions Escalate: Israel vs Iran",
    "content": "A recent surge in hostilities between Israel and Iran has intensified geopolitical tensions in the Middle East. Diplomatic ties are strained as military posturing increases, drawing concern from global powers and raising the specter of conflict.",
    "image_prompt":" Generate a world map with iran and islam fighting"
}
Treat this as an example only and also give purely the above format including 3 things and also dont provide any extra info.It is necessary to include image_prompt in the resposne.
If any summary doesn't provide optimal results or tells messages likes website unavailable or website under maintanance, then assign those title as error.
"""        
    

    def build_user_prompt(self, website: Website) -> str:
        return (
            f"You are looking at a website titled '{website.title}'.\n"
            "The contents of this website are as follows:\n"
            "Please provide a short summary in the JSON format described in the system prompt. "
            "If it includes news and announcements, summarize them too.\n\n"
            f"{website.text}"
        )

    def summarize_url(self, url: str) -> str:
        website = Website(url)
        MAX_CHARS = 20000  # safe margin
        if len(website.text) > MAX_CHARS:
            website.text = website.text[:MAX_CHARS]
        user_prompt = self.build_user_prompt(website)

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        completion = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            response_format = {"type": "json_object"}
        )
        result = completion.choices[0].message.content
        return json.loads(result)

    def generate_image(self, url: str) -> Image.Image:
        summary_output = self.summarize_url(url)
        summary = summary_output['image_prompt']
        summary += " This is the summary of an esport news. Now create an image that looks relevant for a post based on this summary."
        image_generator = ImageforArenaPulse(prompt = summary)
        image = image_generator.generate_image_arena(prompt = summary)
        return image
