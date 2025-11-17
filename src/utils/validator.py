import json

def validate_schema(raw_text):
    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON from LLM.")

    required = [
        "explicit_requirements",
        "implicit_priorities",
        "weights",
        "keywords",
        "essay_guidance",
        "red_flags"
    ]

    for key in required:
        if key not in data:
            raise ValueError(f"Missing field: {key}")

    return data
