# src/llm/client.py (or wherever your file is)

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from the .env file in your project root
load_dotenv()

# Configure the Gemini client with the API key from the environment
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    raise Exception("GOOGLE_API_KEY not found. Please set it in your .env file.")


# In src/llm/client.py

def llm_call(prompt: str, model: str = "gemini-1.5-flash-latest"):
    """
    Makes a call to a Gemini model.
    """
    response = None  # Initialize response to None
    try:
        generative_model = genai.GenerativeModel(model)
        response = generative_model.generate_content(prompt)
        
        # Check if the response was blocked before trying to access .text
        if not response.parts:
            print("The response was blocked.")
            print(f"Prompt Feedback: {response.prompt_feedback}")
            return "Sorry, the response was blocked by the safety filter."
            
        return response.text

    except Exception as e:
        print(f"An error occurred during the API call: {e}")
        # If an error occurred and we have a response object, we can print feedback
        if response:
            print(f"Prompt Feedback: {response.prompt_feedback}")
        return "Sorry, I could not process your request."