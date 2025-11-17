from src.extractors.scholarship_description.extractor import ScholarshipDescriptionExtractor


def test_description_extractor():
    description = """
    The Aurora STEM Excellence Scholarship is awarded to outstanding undergraduate students
    pursuing degrees in computer science, engineering, or mathematics. Candidates must have
    a minimum GPA of 3.7 and demonstrate excellence in research, leadership, and innovation.
    Preference is given to students with significant research experience or strong leadership
    impact in STEM communities. Financial need is considered but not required.
    """

    extractor = ScholarshipDescriptionExtractor(model="gpt-4o-mini")
    output = extractor.extract(description)

    print("\n\n===== EXTRACTOR OUTPUT =====")
    print(output)
    print("============================\n\n")

    # Minimal sanity checks:
    assert "weights" in output
    assert "scholarship_personality" in output
    assert isinstance(output["weights"]["academics"], float)

if __name__ == "__main__":
    test_description_extractor()
