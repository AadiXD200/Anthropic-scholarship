from src.llm.stub_client import StubClient
from src.extractors.scholarship_description.extractor import ScholarshipDescriptionExtractor

description = """
The STEM Innovators Scholarship supports undergraduates who show
creativity, research excellence, leadership, and strong academic performance.
Minimum GPA 3.5. Preference for students who completed hands-on engineering
projects and community outreach.
"""

if __name__ == "__main__":
    llm = StubClient()
    result = extract_scholarship_features(description, llm)
    print(result)
