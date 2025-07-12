import os
import requests
from bs4 import BeautifulSoup

class Website:
    url:str
    title:str
    text:str

    def __init__(self, url):
        self.url = url
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        self.title = soup.title.string if soup.title else "Title not found"
        for irrelevant in soup.body(["scripts","style","img","input"]):
            irrelevant.decompose()
        self.text = soup.body.get_text(separator="\n",strip=True)