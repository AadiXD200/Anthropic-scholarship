from typing import List
from .schema import WinnerIdentifier
from . import utils
from src.llm.client import llm_json_call
from typing import List 

class PastWinnerExtractor:
    """
    An extractor that finds the names of past scholarship winners
    by searching the web.
    """
    def _get_search_queries(self, scholarship_name: str) -> List[str]:
        prompt = f"""
        Generate a JSON list of 5 diverse search queries to find web pages listing past winners for the "{scholarship_name}".
        Focus on queries for official announcements and university press releases.
        Respond ONLY with a JSON object with a single key "queries".

        Example format:
        {{
            "queries": ["query 1", "query 2", "query 3"]
        }}
        """
        response = llm_json_call(prompt)
        return response.get("queries", []) if response else []

    def _extract_names_from_text(self, page_content: str, scholarship_name) -> List[WinnerIdentifier]:
        prompt = f"""
        You are a highly precise data extraction system. From the provided text of a scholarship winner announcement, extract the full names of the winners.

        **CRITICAL INSTRUCTIONS:**
        1.  Only extract names that are clearly identified as scholars, winners, or recipients of the scholarship - {scholarship_name}. Look for phrases like "was selected as a scholar", "the winners are:", "joins the cohort of".
        2.  For each name, extract their university, city, or field of study as the 'context_clue' if it is mentioned nearby.
        3.  **DO NOT** extract names from navigation links, footers, author bylines, or general news headlines that are not part of the winner list.
        4.  If the text contains multiple articles, only focus on the main article that lists the winners.

        Respond ONLY with a JSON object with a single key "winners" containing a list of objects. If no valid winners are found, return an empty list.

        Example format:
        {{
            "winners": [
                {{"winner_name": "John Doe", "context_clue": "Harvard University"}},
                {{"winner_name": "Jane Smith", "context_clue": "Computer Science"}}
            ]
        }}
        
        Webpage Text:
        ---
        {page_content}
        ---
        """
        response = llm_json_call(prompt)
        if response and "winners" in response and isinstance(response["winners"], list):
            return [WinnerIdentifier(**winner) for winner in response["winners"]]
        return []

    def extract(self, scholarship_name: str) -> List[WinnerIdentifier]:
        print(f"--- Starting past winner search for: {scholarship_name} ---")

        # This is the correct variable we will use throughout the function.
        all_identifiers = []
        unique_names = set()

        search_queries = self._get_search_queries(scholarship_name)
        print(search_queries)
        if not search_queries:
            print("Could not generate search queries. Aborting.")
            return []
        
        print(f"Generated {len(search_queries)} search queries.")
        processed_urls = set()

        for query in search_queries:
            print(query)
            search_results = utils.search_web_for_winners(query)
            for result in search_results:
                url = result.get('url')
                if not url or url in processed_urls:
                    continue
                
                print(f"Processing: {url}")
                content = utils.scrape_url(url)
                processed_urls.add(url)
                
                if not content:
                    continue

                if not self._is_winner_announcement_page(url, content):
                    print("  -> Skipping page: Not a valid winner announcement.")
                    continue

                print("  -> Page validated. Extracting names...")
                
                # --- START: TWO-PASS LOGIC ---
                # PASS 1: Extract potential candidates (High Recall)
                print("  -> Pass 1: Identifying candidate names...")
                potential_identifiers_list = self._extract_names_from_text(content, scholarship_name)
                if not potential_identifiers_list:
                    print("    No candidates found.")
                    continue
                
                potential_names_map = {p.winner_name: p for p in potential_identifiers_list}
                print(f"    Found {len(potential_names_map)} candidates.")

                # PASS 2: Verify candidates against the text (High Precision)
                print("  -> Pass 2: Verifying candidates...")
                confirmed_names = self._verify_winner_names(content, list(potential_names_map.keys()))
                print(f"    Verified {len(confirmed_names)} names as winners.")
                
                # --- END: TWO-PASS LOGIC ---

                # Add only the confirmed winners to our final list
                for name in confirmed_names:
                    if name not in unique_names:
                        identifier = potential_names_map.get(name)
                        if identifier:
                            # We append to all_identifiers
                            all_identifiers.append(identifier)
                            unique_names.add(name)
                            print(f"      -> CONFIRMED: {name}")

        # --- FIX IS HERE ---
        # Change 'all_confirmed_winners' to 'all_identifiers'
        print(f"\n--- Process Complete. Found {len(all_identifiers)} unique, confirmed winners. ---")
        return all_identifiers
    
    def _is_winner_announcement_page(self, url: str, page_content: str) -> bool:
        """
        Uses an LLM call to validate if the page is a scholarship winner announcement,
        using both the URL and page content as evidence.
        """
        # The new prompt includes the URL and has improved instructions
        prompt = f"""
        You are a web content analyst. Your task is to determine if the given webpage is a primary source for a list or announcement of scholarship winners.
        Analyze BOTH the URL and the beginning of the page text to make your decision.

        **CRITICAL EVIDENCE TO CONSIDER:**
        - **URL ANALYSIS:** Does the URL contain keywords like "winners", "scholars", "directory", "bios", "announcement", "meet-the-class"? A URL like ".../rhodes-scholar-bios" is VERY strong evidence.
        - **TEXT ANALYSIS:** Does the text contain headings like "Meet the Scholars", "Class of 2024", or a clear list of names with universities/majors?

        The page IS a valid source even if it's a simple directory or list, not just a formal press release.
        The page is NOT a valid source if it's a general news archive, a staff page, or a generic article that only mentions a single winner in passing.

        Respond with only "true" if it is a valid source, and "false" if it is not.

        EVIDENCE:
        1. URL: {url}
        2. Page Text (first 2000 chars):
        ---
        {page_content[:2000]}
        ---

        Is this a valid winner announcement or list? Respond with only "true" or "false".
        """
        from src.llm.client import llm_call 
        response = llm_call(prompt).strip().lower()
        
        # Adding a simple keyword check as a safety net for cases the LLM might miss.
        # This makes the system more robust.
        url_keywords = ["winner", "scholar", "directory", "bio", "cohort", "class-of", "announcement"]
        if any(keyword in url.lower() for keyword in url_keywords):
            print("  -> URL keyword match found, boosting confidence.")
            return True

        return response == "true"
    
    def _verify_winner_names(self, page_content: str, potential_names: List[str]) -> List[str]:
        """
        Takes a list of potential names and verifies them against the full text.
        Returns a new list containing only the names that are explicitly confirmed as winners.
        """
        if not potential_names:
            return []

        # We format the list of names for the prompt
        names_to_check = ", ".join(f'"{name}"' for name in potential_names)

        prompt = f"""
        You are a meticulous verification agent. Your task is to review a list of candidate names and confirm if they are EXPLICITLY identified as scholarship winners in the provided text.

        **CRITICAL INSTRUCTIONS:**
        1. For each candidate name, carefully read the sentences around it in the text.
        2. A name is CONFIRMED only if the text uses phrases like "was awarded the scholarship", "is a new scholar", "the winners include [Name]", "[Name] was selected for", or similar direct confirmations.
        3. A name is REJECTED if they are mentioned in a different role (e.g., a university president, a professor, an author) or if their status as a winner is ambiguous.

        Here is the list of candidate names to verify:
        [{names_to_check}]

        Here is the full text to verify against:
        ---
        {page_content}
        ---

        Based on your verification, provide a final JSON object with a single key "confirmed_winners" containing a list of strings of only the names that are 100% confirmed as winners.
        If you cannot confirm any of the names, return an empty list.

        Example format:
        {{
            "confirmed_winners": ["John Doe", "Jane Smith"]
        }}
        """
        response = llm_json_call(prompt)
        
        if response and "confirmed_winners" in response and isinstance(response["confirmed_winners"], list):
            return response["confirmed_winners"]
        return []