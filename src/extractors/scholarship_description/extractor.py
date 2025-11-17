import json
from .prompts import SCHOLARSHIP_EXTRACTOR_PROMPT
from .schema import ScholarshipDescriptionOutput
from .utils import clean_json
from src.llm.client import llm_call

class ScholarshipDescriptionExtractor:
    def __init__(self, model="gpt-4o-mini"):
        self.model = model

    def extract(self, description: str) -> dict:
        prompt = SCHOLARSHIP_EXTRACTOR_PROMPT + "\n\nSCHOLARSHIP DESCRIPTION:\n" + description

        response = llm_call(prompt, model=self.model)

        cleaned = clean_json(response)
        parsed = ScholarshipDescriptionOutput(**cleaned)

        return parsed.dict()
