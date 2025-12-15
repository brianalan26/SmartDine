from math import radians, sin, cos, sqrt, atan2
from typing import List, Dict, Optional
from decimal import Decimal

class RecommendationEngine:
    
    COIMBATORE_BOUNDS = {
        'min_lat': 10.9,
        'max_lat': 11.1,
        'min_lng': 76.9,
        'max_lng': 77.1
    }

    def __init__(self):
        self.mood_keywords = {
            'spicy': ['spicy', 'hot', 'chili', 'spice', 'fiery'],
            'comfort': ['comfort', 'cozy', 'homely', 'comfort food', 'nostalgia'],
            'light': ['light', 'healthy', 'fresh', 'salad', 'diet'],
            'heavy': ['heavy', 'filling', 'hearty', 'rich'],
            'sweet': ['sweet', 'dessert', 'cake', 'ice cream'],
            'quick': ['quick', 'fast', 'grab', 'takeaway'],
            'fancy': ['fancy', 'fine dining', 'upscale', 'elegant', 'premium'],
            'casual': ['casual', 'relaxed', 'chill', 'laid back'],
            'late night': ['late night', 'midnight', 'late'],
        }

        self.cuisine_keywords = {
            'biryani': ['biryani', 'biriyani'],
            'chinese': ['chinese', 'noodles', 'fried rice', 'manchurian'],
            'south indian': ['south indian', 'dosa', 'idli', 'vada', 'sambar'],
            'north indian': ['north indian', 'naan', 'paneer', 'tandoor', 'roti'],
            'italian': ['italian', 'pasta', 'pizza'],
            'continental': ['continental', 'steak', 'continental'],
            'street food': ['street food', 'chaat', 'snacks'],
            'seafood': ['seafood', 'fish', 'prawn', 'crab'],
        }

    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0
        
        lat1_rad = radians(lat1)
        lon1_rad = radians(lon1)
        lat2_rad = radians(lat2)
        lon2_rad = radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        distance = R * c
        return round(distance, 2)

    def is_within_coimbatore(self, lat: float, lng: float) -> bool:
        bounds = self.COIMBATORE_BOUNDS
        return (bounds['min_lat'] <= lat <= bounds['max_lat'] and 
                bounds['min_lng'] <= lng <= bounds['max_lng'])

    def extract_budget(self, query: str) -> Optional[int]:
        query_lower = query.lower()
        
        if 'under' in query_lower or 'below' in query_lower:
            words = query_lower.split()
            for i, word in enumerate(words):
                if word in ['under', 'below'] and i + 1 < len(words):
                    try:
                        return int(''.join(filter(str.isdigit, words[i + 1])))
                    except ValueError:
                        pass
        
        budget_ranges = {
            'cheap': 200,
            'budget': 300,
            'affordable': 400,
            'moderate': 600,
            'expensive': 1000,
            'premium': 1500,
        }
        
        for keyword, budget in budget_ranges.items():
            if keyword in query_lower:
                return budget
        
        return None

    def match_mood(self, query: str, tags: str) -> int:
        query_lower = query.lower()
        tags_lower = tags.lower()
        score = 0
        
        for mood, keywords in self.mood_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    if mood in tags_lower or keyword in tags_lower:
                        score += 20
        
        return score

    def match_cuisine(self, query: str, cuisines: str, must_try: str) -> int:
        query_lower = query.lower()
        cuisines_lower = cuisines.lower()
        must_try_lower = must_try.lower()
        score = 0
        
        for cuisine_type, keywords in self.cuisine_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    if cuisine_type in cuisines_lower or keyword in cuisines_lower:
                        score += 30
                    if keyword in must_try_lower:
                        score += 10
        
        return score

    def score_restaurant(
        self, 
        restaurant: Dict, 
        query: str, 
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        max_budget: Optional[int] = None,
        recent_restaurants: List[int] = None,
        favorite_restaurants: List[int] = None
    ) -> float:
        score = 0.0
        
        score += float(restaurant['rating']) * 10
        
        if user_lat and user_lng:
            distance = self.calculate_distance(
                user_lat, user_lng,
                float(restaurant['latitude']), float(restaurant['longitude'])
            )
            restaurant['distance'] = distance
            
            if distance < 2:
                score += 30
            elif distance < 5:
                score += 20
            elif distance < 10:
                score += 10
            else:
                score -= 10
        
        score += self.match_cuisine(query, restaurant['cuisines'], restaurant['must_try_dishes'])
        score += self.match_mood(query, restaurant['tags'])
        
        if max_budget:
            if restaurant['average_cost'] <= max_budget:
                score += 15
                if restaurant['average_cost'] <= max_budget * 0.8:
                    score += 10
            else:
                score -= 30
        
        if favorite_restaurants and restaurant['id'] in favorite_restaurants:
            score += 25
        
        if recent_restaurants and restaurant['id'] in recent_restaurants:
            score -= 40
        
        return score

    def recommend(
        self,
        restaurants: List[Dict],
        query: str,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        filters: Optional[Dict] = None,
        recent_restaurants: List[int] = None,
        favorite_restaurants: List[int] = None,
        limit: int = 3
    ) -> List[Dict]:
        
        max_budget = self.extract_budget(query)
        if filters and filters.get('max_budget'):
            max_budget = filters['max_budget']
        
        filtered = restaurants
        
        if filters:
            if filters.get('cuisines'):
                cuisine_filter = [c.lower() for c in filters['cuisines']]
                filtered = [r for r in filtered 
                           if any(c in r['cuisines'].lower() for c in cuisine_filter)]
            
            if filters.get('is_veg') is not None:
                filtered = [r for r in filtered if r['is_veg'] == filters['is_veg']]
            
            if filters.get('min_rating'):
                filtered = [r for r in filtered if r['rating'] >= filters['min_rating']]
            
            if filters.get('max_travel_time') and user_lat and user_lng:
                max_distance = filters['max_travel_time'] / 60 * 30
                filtered = [r for r in filtered 
                           if self.calculate_distance(user_lat, user_lng, 
                              float(r['latitude']), float(r['longitude'])) <= max_distance]
        
        if user_lat and user_lng:
            if not self.is_within_coimbatore(user_lat, user_lng):
                return []
        
        scored = []
        for restaurant in filtered:
            score = self.score_restaurant(
                restaurant, query, user_lat, user_lng, max_budget,
                recent_restaurants, favorite_restaurants
            )
            scored.append((restaurant, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        
        if limit:
            top_results = [r[0] for r in scored[:limit]]
        else:
            top_results = [r[0] for r in scored]
        
        return top_results
