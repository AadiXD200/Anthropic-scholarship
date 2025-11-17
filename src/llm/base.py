from abc import ABC, abstractmethod

class BaseLLM(ABC):
    
    @abstractmethod
    def generate(self, prompt: str) -> str:
        """Return raw text response from LLM."""
        pass
