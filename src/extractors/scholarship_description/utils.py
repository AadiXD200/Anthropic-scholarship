import json
import re

def clean_json(text: str) -> dict:
    """
    Extract the JSON block from an LLM response safely.
    Handles:
    - trailing text
    - markdown fences
    - messy formatting
    """
    try:
        json_part = re.search(r"\{.*\}", text, flags=re.S).group()
        return json.loads(json_part)
    except:
        raise ValueError("Failed to parse LLM JSON output.")
