from src.llm.stub_client import StubClient
from src.extractors.scholarship_description.extractor import ScholarshipDescriptionExtractor
import json
import os
from src.extractors.past_winners.extractor import PastWinnerExtractor

def run_description_analysis(description):
    """Analyzes a single scholarship description."""
    print("--- Running Scholarship Description Analysis ---")
    extractor = ScholarshipDescriptionExtractor()
    output = extractor.extract(description)
    print("\n--- Description Analysis Output ---")
    print(json.dumps(output, indent=2))
    return output

def run_past_winner_extraction(scholarship_name, output_dir="data"):
    """Finds past winners and saves them to a file."""
    print(f"\n--- Running Past Winner Extraction for: {scholarship_name} ---")
    extractor = PastWinnerExtractor()
    winners = extractor.extract(scholarship_name)

    if winners:
        # Ensure the output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Sanitize scholarship name for filename
        filename_safe_name = "".join(c for c in scholarship_name if c.isalnum() or c in (' ', '_')).rstrip()
        output_path = os.path.join(output_dir, f"past_winners_{filename_safe_name.replace(' ', '_')}.json")

        # Convert Pydantic objects to a list of dictionaries for JSON serialization
        winners_dict = [winner.dict() for winner in winners]

        with open(output_path, 'w') as f:
            json.dump(winners_dict, f, indent=2)
        
        print(f"\nSuccessfully saved {len(winners)} winner profiles to {output_path}")
    else:
        print("\nCould not find any past winners.")

    return winners


SCHOLARSHIP_NAME = "Rhodes Scholarship"
SCHOLARSHIP_DESCRIPTION = """
The Rhodes Scholarship is a prestigious international postgraduate award for students to study at the University of Oxford.
It seeks young leaders of outstanding intellect and character who are motivated to engage with global challenges,
committed to the service of others and show promise of becoming value-driven, principled leaders for the world's future.
Key criteria include academic excellence, energy to use one's talents to the full, truth, courage, devotion to duty,
and moral force of character.
"""

if __name__ == "__main__":
    run_description_analysis(SCHOLARSHIP_DESCRIPTION)
    run_past_winner_extraction(SCHOLARSHIP_NAME)

