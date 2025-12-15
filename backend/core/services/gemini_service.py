import os
import google.generativeai as genai
from typing import Optional

class GeminiService:
    def __init__(self):
        self.api_keys = [
            os.getenv('GEMINI_API_KEY_1'),
            os.getenv('GEMINI_API_KEY_2'),
            os.getenv('GEMINI_API_KEY_3'),
        ]
        self.current_key_index = 0
        self.model_name = 'gemini-pro'

    def _get_next_key(self) -> str:
        key = self.api_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        return key

    def generate_recommendation_explanation(
        self, 
        user_query: str, 
        restaurants: list,
        conversation_history: list = None
    ) -> Optional[str]:
        try:
            api_key = self._get_next_key()
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(self.model_name)

            restaurant_details = []
            for r in restaurants:
                restaurant_details.append(
                    f"- {r['name']}: {r['cuisines']}, {r['special_recognition']}, "
                    f"rated {r['rating']}/5, average cost ₹{r['average_cost']}"
                )

            context = ""
            if conversation_history:
                recent = conversation_history[-3:]
                context = "Recent conversation:\n"
                for item in recent:
                    context += f"User: {item.get('query', '')}\n"

            prompt = f"""You are a friendly food assistant helping someone in Coimbatore find great food.

{context}

Current request: "{user_query}"

Recommended restaurants:
{chr(10).join(restaurant_details)}

Write a warm, conversational response (2-3 sentences) explaining why these restaurants match their request. 
Be specific about what makes each place special. Keep it natural and helpful.
"""

            response = model.generate_content(prompt)
            return response.text

        except Exception as e:
            return None

    def generate_surprise_explanation(self, restaurant: dict) -> Optional[str]:
        try:
            api_key = self._get_next_key()
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(self.model_name)

            prompt = f"""You're a food enthusiast sharing an exciting discovery in Coimbatore.

Restaurant: {restaurant['name']}
Known for: {restaurant['special_recognition']}
Cuisines: {restaurant['cuisines']}
Must-try: {restaurant['must_try_dishes']}
Rating: {restaurant['rating']}/5

Write an enthusiastic 2-3 sentence recommendation explaining what makes this place special and worth trying.
Be genuine and specific.
"""

            response = model.generate_content(prompt)
            return response.text

        except Exception as e:
            return None
