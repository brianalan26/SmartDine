import os
import google.generativeai as genai
from typing import Optional
import random

class GeminiService:
    def __init__(self):
        self.api_keys = [
            key for key in [
                os.getenv('GEMINI_API_KEY_1'),
                os.getenv('GEMINI_API_KEY_2'),
                os.getenv('GEMINI_API_KEY_3'),
            ] if key
        ]
        self.current_key_index = 0
        self.model_name = 'gemini-pro'

    def _get_next_key(self) -> str:
        if not self.api_keys:
            raise Exception("No API keys available")
        key = self.api_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        return key

    def _generate_with_retry(self, prompt: str) -> Optional[str]:
        attempts = 0
        max_attempts = len(self.api_keys)
        
        while attempts < max_attempts:
            try:
                api_key = self._get_next_key()
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(self.model_name)
                response = model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"Gemini API error (attempt {attempts+1}): {e}")
                attempts += 1
                continue
        
        return None

    def generate_recommendation_explanation(
        self, 
        user_query: str, 
        restaurants: list,
        conversation_history: list = None
    ) -> Optional[str]:
        restaurant_details = []
        for r in restaurants:
            restaurant_details.append(
                f"- {r['name']} ({r['cuisines']}): {r['special_recognition']}. "
                f"Rated {r['rating']}/5. Cost: ₹{r['average_cost']} for two."
            )

        context = ""
        if conversation_history:
            recent = conversation_history[-3:]
            context = "Recent context:\n" + "\n".join([f"User asked: {item.get('query', '')}" for item in recent])

        prompt = f"""You are a warm, knowledgeable food friend in Coimbatore. 
You are helping a user decide where to eat based on: "{user_query}".

{context}

Here are the best matches:
{chr(10).join(restaurant_details)}

Task:
Write a natural, caring response (2-3 sentences). 
- Address their mood/situation if implied in the query (e.g., "Since you're having a hectic day...").
- Explain WHY these specific places fit their vibe.
- If the places don't seem to offer the specific dish requested (e.g. rare items), acknowledge that politely and suggest these as great high-quality alternatives.
- Don't just list them; weave them into a suggestion.
- Rate limits or tech issues are NOT your concern; just talk food.
"""
        return self._generate_with_retry(prompt)

    def generate_surprise_explanation(self, restaurant: dict) -> Optional[str]:
        prompt = f"""You are a food lover sharing a hidden gem in Coimbatore.

Restaurant: {restaurant['name']}
Vibe/Tag: {restaurant['special_recognition']}
Cuisine: {restaurant['cuisines']}
Must-try: {restaurant['must_try_dishes']}
Rating: {restaurant['rating']}/5

Task:
Write a short, enthusiastic suggestion (2 sentences) on why they must try this place TODAY. 
Make it sound like a personal secret you're sharing.
"""
        return self._generate_with_retry(prompt)
