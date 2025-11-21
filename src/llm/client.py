# src/llm/client.py (or wherever your file is)

import os
import google.generativeai as genai
from dotenv import load_dotenv
import re
import json

# Load environment variables from the .env file in your project root
load_dotenv()

# Configure the Gemini client with the API key from the environment
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    raise Exception("GOOGLE_API_KEY not found. Please set it in your .env file.")

def clean_json_output(text: str) -> str:
    """Cleans the raw LLM output to extract only the JSON part."""
    # This regex handles ```json ... ``` markdown blocks
    match = re.search(r'```(json)?\s*({.*?})\s*```', text, re.DOTALL)
    if match:
        return match.group(2)
    # This is a fallback for raw JSON without markdown
    match = re.search(r'({.*})', text, re.DOTALL)
    if match:
        return match.group(1)
    return text

# In src/llm/client.py

def llm_call(prompt: str, model: str = "gemini-flash-latest"):
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
    
def llm_json_call(prompt: str, model: str = "gemini-flash-latest") -> dict | None:
    """Makes a call to a Gemini model and attempts to parse a JSON response."""
    raw_response = llm_call(prompt, model)
    if not raw_response:
        return None
    
    cleaned_response = clean_json_output(raw_response)
    try:
        return json.loads(cleaned_response)
    except json.JSONDecodeError:
        print("Failed to decode JSON from LLM response:")
        print(f"---RAW---\n{raw_response}\n---------")
        return None