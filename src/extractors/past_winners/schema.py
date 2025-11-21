from pydantic import BaseModel, Field
from typing import Optional

class WinnerIdentifier(BaseModel):
    """Schema for identifying a potential winner from an announcement page."""
    winner_name: str = Field(description="The full name of the scholarship winner.")
    context_clue: Optional[str] = Field(description="Key context to identify this person, such as their university, city, or major.")