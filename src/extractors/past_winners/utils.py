import os
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
from typing import List

# Tavily client is initialized once using the API key from .env
tavily_client = TavilyClient(api_key=os.environ.get("TAVILY_API_KEY"))

def search_web_for_winners(query: str, max_results: int = 5) -> List[dict]:
    """Performs a web search using Tavily and returns the results."""
    try:
        response = tavily_client.search(query=query, max_results=max_results)
        return response.get('results', [])
    except Exception as e:
        print(f"Error during Tavily search: {e}")
        return []

def scrape_url(url: str, max_length: int = 8000) -> str:
    """Scrapes the text content of a URL, returning up to max_length characters."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        text = soup.get_text(separator=' ', strip=True)
        return text[:max_length]
    except requests.RequestException as e:
        print(f"Error scraping {url}: {e}")
        return ""