from django.contrib import admin
from .models import Restaurant, Favorite, SearchHistory, SavedDiscovery

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'cuisines', 'rating', 'average_cost', 'price_range']
    list_filter = ['is_veg', 'is_open_late', 'rating']
    search_fields = ['name', 'address', 'cuisines']

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant', 'created_at']
    list_filter = ['created_at']

@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'query', 'selected_restaurant', 'created_at']
    list_filter = ['created_at']

@admin.register(SavedDiscovery)
class SavedDiscoveryAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant_name', 'area', 'source', 'created_at']
    list_filter = ['source', 'created_at']
