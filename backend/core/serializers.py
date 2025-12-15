from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Restaurant, Favorite, SearchHistory, SavedDiscovery

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RestaurantSerializer(serializers.ModelSerializer):
    is_favorite = serializers.SerializerMethodField()
    distance = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)

    class Meta:
        model = Restaurant
        fields = '__all__'

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, restaurant=obj).exists()
        return False

class FavoriteSerializer(serializers.ModelSerializer):
    restaurant = RestaurantSerializer()

    class Meta:
        model = Favorite
        fields = ['id', 'restaurant', 'created_at']

class SearchHistorySerializer(serializers.ModelSerializer):
    selected_restaurant = RestaurantSerializer(read_only=True)

    class Meta:
        model = SearchHistory
        fields = ['id', 'query', 'selected_restaurant', 'created_at']

class SavedDiscoverySerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedDiscovery
        fields = ['id', 'restaurant_name', 'area', 'source', 'google_maps_link', 
                  'image_url', 'notes', 'created_at']
