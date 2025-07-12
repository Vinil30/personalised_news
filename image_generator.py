#this file is to generate images for ArenaPulse.py (news)
import os
from gradio_client import Client
from PIL import Image
class ImageforArenaPulse:
    def __init__(self,prompt,HF_TOKEN = None, model = "black-forest-labs/FLUX.1-schnell"):
        self.model = model
        self.prompt = prompt
        self.HF_TOKEN = os.environ.get('HF_TOKEN')
        self.client = Client("black-forest-labs/FLUX.1-schnell")
    def generate_image_arena(self,prompt)-> Image.Image:
        result = self.client.predict(
    prompt=self.prompt,
    seed=0,
    randomize_seed=True,
    width=360,
    height=540,
    num_inference_steps=4,
    api_name="/infer"
)
        image_path = result[0]
        image = Image.open(image_path)
        return image
