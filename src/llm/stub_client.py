from src.llm.base import BaseLLM
import json

class StubClient(BaseLLM):
    def generate(self, prompt: str) -> str:
        # Return a deterministic JSON for development
        return json.dumps({
            "explicit_requirements": ["GPA 3.5+", "STEM major"],
            "implicit_priorities": ["innovation", "community impact"],
            "weights": {
                "academics": 0.4,
                "leadership": 0.2,
                "service": 0.2,
                "innovation": 0.1,
                "financial_need": 0.1
            },
            "keywords": ["STEM", "innovation", "project"],
            "essay_guidance": {
                "preferred_tone": "confident",
                "story_style": "project-driven",
                "what_to_emphasize": ["research", "leadership"],
                "what_to_avoid": ["generic claims"]
            },
            "red_flags": ["low GPA", "no technical projects"]
        })

