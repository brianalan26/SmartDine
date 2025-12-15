from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from decimal import Decimal
import random

from .models import Restaurant, Favorite, SearchHistory, SavedDiscovery
from .serializers import (
    UserSerializer, RestaurantSerializer, FavoriteSerializer,
    SearchHistorySerializer, SavedDiscoverySerializer
)
from .services.recommendation_engine import RecommendationEngine
from .services.gemini_service import GeminiService

recommendation_engine = RecommendationEngine()
gemini_service = GeminiService()

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    email = request.data.get('email')
    password = request.data.get('password')
    username = email.split('@')[0]

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    login(request, user)

    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
        user = authenticate(request, username=user.username, password=password)
    except User.DoesNotExist:
        user = None

    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    login(request, user)

    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([AllowAny])
def auth_status(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response({
            'authenticated': True,
            'user': serializer.data
        })
    return Response({'authenticated': False})

@api_view(['GET'])
@permission_classes([AllowAny])
def list_restaurants(request):
    restaurants = Restaurant.objects.all()
    
    cuisines = request.GET.get('cuisines')
    if cuisines:
        cuisine_list = cuisines.split(',')
        q_objects = Q()
        for cuisine in cuisine_list:
            q_objects |= Q(cuisines__icontains=cuisine.strip())
        restaurants = restaurants.filter(q_objects)
    
    is_veg = request.GET.get('is_veg')
    if is_veg is not None:
        restaurants = restaurants.filter(is_veg=(is_veg.lower() == 'true'))
    
    min_rating = request.GET.get('min_rating')
    if min_rating:
        restaurants = restaurants.filter(rating__gte=float(min_rating))
    
    max_budget = request.GET.get('max_budget')
    if max_budget:
        restaurants = restaurants.filter(average_cost__lte=int(max_budget))
    
    serializer = RestaurantSerializer(
        restaurants, 
        many=True, 
        context={'request': request}
    )
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def recommend(request):
    query = request.data.get('query', '')
    user_lat = request.data.get('latitude')
    user_lng = request.data.get('longitude')
    filters = request.data.get('filters', {})

    if not query:
        return Response(
            {'error': 'Query is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    recent_restaurant_ids = []
    favorite_restaurant_ids = []
    conversation_history = []

    if request.user.is_authenticated:
        recent_history = SearchHistory.objects.filter(
            user=request.user
        ).order_by('-created_at')[:5]
        
        recent_restaurant_ids = [
            h.selected_restaurant.id 
            for h in recent_history 
            if h.selected_restaurant
        ]
        
        conversation_history = [
            {'query': h.query} 
            for h in recent_history
        ]

        favorites = Favorite.objects.filter(user=request.user)
        favorite_restaurant_ids = [f.restaurant.id for f in favorites]

    restaurants = Restaurant.objects.all()
    restaurant_dicts = [
        {
            'id': r.id,
            'name': r.name,
            'address': r.address,
            'latitude': r.latitude,
            'longitude': r.longitude,
            'cuisines': r.cuisines,
            'price_range': r.price_range,
            'average_cost': r.average_cost,
            'rating': float(r.rating),
            'tags': r.tags,
            'must_try_dishes': r.must_try_dishes,
            'special_recognition': r.special_recognition,
            'google_maps_link': r.google_maps_link,
            'swiggy_link': r.swiggy_link,
            'zomato_link': r.zomato_link,
            'is_veg': r.is_veg,
            'is_open_late': r.is_open_late,
        }
        for r in restaurants
    ]

    all_recommended = recommendation_engine.recommend(
        restaurants=restaurant_dicts,
        query=query,
        user_lat=float(user_lat) if user_lat else None,
        user_lng=float(user_lng) if user_lng else None,
        filters=filters,
        recent_restaurants=recent_restaurant_ids,
        favorite_restaurants=favorite_restaurant_ids,
        limit=None # Get all matches for the map
    )

    if not all_recommended:
        return Response({
            'restaurants': [],
            'explanation': 'No restaurants found matching your criteria in Coimbatore. Try adjusting your filters or search query.',
            'fallback': True
        })

    # Only use top 3 for Gemini explanation
    top_3_recommendations = all_recommended[:3]

    explanation = gemini_service.generate_recommendation_explanation(
        user_query=query,
        restaurants=top_3_recommendations,
        conversation_history=conversation_history
    )

    if not explanation:
        explanation = f"Here are {len(top_3_recommendations)} great options for your request. Each one offers something special!"

    if request.user.is_authenticated:
        SearchHistory.objects.create(
            user=request.user,
            query=query,
            user_location_lat=Decimal(str(user_lat)) if user_lat else None,
            user_location_lng=Decimal(str(user_lng)) if user_lng else None
        )

    # Return ALL recommended restaurants for the map population
    serializer = RestaurantSerializer(
        [Restaurant.objects.get(id=r['id']) for r in all_recommended],
        many=True,
        context={'request': request}
    )

    response_data = serializer.data
    # Map distances back to serializer data
    # Create a mapping of id -> distance for O(1) lookup
    dist_map = {r['id']: r.get('distance') for r in all_recommended}
    
    for item in response_data:
        if item['id'] in dist_map and dist_map[item['id']] is not None:
             item['distance'] = str(dist_map[item['id']])

    return Response({
        'restaurants': response_data, # All matching restaurants for Map
        'top_restaurants': response_data[:3], # Top 3 if needed separately
        'explanation': explanation,
        'fallback': False
    })
@api_view(['GET'])
@permission_classes([AllowAny])
def surprise(request):
    user_lat = request.GET.get('latitude')
    user_lng = request.GET.get('longitude')
    
    # Get random high-rated restaurants
    candidates = list(Restaurant.objects.filter(rating__gte=4.0))
    if len(candidates) > 3:
        selected_restaurants = random.sample(candidates, 3)
    else:
        selected_restaurants = candidates

    if not selected_restaurants:
        return Response(
            {'error': 'No restaurants available'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Calculate distance if location provided
    results = []
    for r in selected_restaurants:
        dist = None
        if user_lat and user_lng:
            dist = recommendation_engine.calculate_distance(
                float(user_lat), float(user_lng),
                float(r.latitude), float(r.longitude)
            )
        
        results.append({
            'restaurant': RestaurantSerializer(r, context={'request': request}).data,
            'distance': dist
        })

    # Pick the "primary" one for the explanation
    primary = selected_restaurants[0]
    restaurant_dict = {
        'name': primary.name,
        'special_recognition': primary.special_recognition,
        'cuisines': primary.cuisines,
        'must_try_dishes': primary.must_try_dishes,
        'rating': float(primary.rating),
    }

    explanation = gemini_service.generate_surprise_explanation(restaurant_dict)
    if not explanation:
        explanation = f"You should definitely try {primary.name}! It's known for {primary.special_recognition}."

    return Response({
        'restaurants': [r['restaurant'] for r in results], # Send list of restaurants
        'restaurant': results[0]['restaurant'], # Keep backward compatibility content
        'explanation': explanation
    })
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def favorites(request):
    if request.method == 'GET':
        user_favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(user_favorites, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        restaurant_id = request.data.get('restaurant_id')
        
        if not restaurant_id:
            return Response(
                {'error': 'Restaurant ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return Response(
                {'error': 'Restaurant not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            restaurant=restaurant
        )

        if created:
            return Response(
                {'message': 'Added to favorites'},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {'message': 'Already in favorites'},
                status=status.HTTP_200_OK
            )

    elif request.method == 'DELETE':
        restaurant_id = request.data.get('restaurant_id')
        
        if not restaurant_id:
            return Response(
                {'error': 'Restaurant ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted = Favorite.objects.filter(
            user=request.user,
            restaurant_id=restaurant_id
        ).delete()

        if deleted[0] > 0:
            return Response({'message': 'Removed from favorites'})
        else:
            return Response(
                {'error': 'Favorite not found'},
                status=status.HTTP_404_NOT_FOUND
            )
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history(request):
    user_history = SearchHistory.objects.filter(user=request.user)[:20]
    serializer = SearchHistorySerializer(user_history, many=True)
    return Response(serializer.data)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def saved_discoveries(request):
    if request.method == 'GET':
        discoveries = SavedDiscovery.objects.filter(user=request.user)
        serializer = SavedDiscoverySerializer(discoveries, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data.copy()
        
        discovery = SavedDiscovery.objects.create(
            user=request.user,
            restaurant_name=data.get('restaurant_name'),
            area=data.get('area'),
            source=data.get('source', 'other'),
            google_maps_link=data.get('google_maps_link', ''),
            image_url=data.get('image_url', ''),
            notes=data.get('notes', '')
        )

        serializer = SavedDiscoverySerializer(discovery)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_selection(request):
    history_id = request.data.get('history_id')
    restaurant_id = request.data.get('restaurant_id')
    if not history_id or not restaurant_id:
        return Response(
            {'error': 'History ID and Restaurant ID are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        history = SearchHistory.objects.get(id=history_id, user=request.user)
        restaurant = Restaurant.objects.get(id=restaurant_id)
        history.selected_restaurant = restaurant
        history.save()
        return Response({'message': 'Selection recorded'})
    except (SearchHistory.DoesNotExist, Restaurant.DoesNotExist):
        return Response(
            {'error': 'Invalid history or restaurant ID'},
            status=status.HTTP_404_NOT_FOUND
        )
