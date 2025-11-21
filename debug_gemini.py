# debug_gemini.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

print("--- Starting Gemini Debug Script ---")

try:
    # 1. Print library version to be 100% sure
    print(f"Using google-generativeai version: {genai.__version__}")

    # 2. Load API key
    load_dotenv()
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file!")
    print("Successfully loaded GOOGLE_API_KEY from .env file.")
    
    genai.configure(api_key=api_key)

    # 3. Make the simplest possible API call
    print("Initializing model gemini-1.5-flash-latest...")
    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    print("Sending request to the API...")
    response = model.generate_content("hello")

    # 4. Print the result
    print("\n--- SUCCESS! ---")
    print("API Response:", response.text)

except Exception as e:
    print("\n--- SCRIPT FAILED ---")
    print(f"An error occurred: {type(e).__name__}")
    print(f"Error Details: {e}")

finally:
    print("\n--- Debug Script Finished ---")