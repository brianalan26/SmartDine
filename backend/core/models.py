from django.db import models
from django.contrib.auth.models import User

class Restaurant(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    cuisines = models.CharField(max_length=300)
    price_range = models.CharField(max_length=50)
    average_cost = models.IntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    tags = models.CharField(max_length=500)
    must_try_dishes = models.TextField()
    special_recognition = models.CharField(max_length=300, blank=True)
    google_maps_link = models.URLField()
    swiggy_link = models.URLField(blank=True)
    zomato_link = models.URLField(blank=True)
    is_veg = models.BooleanField(default=False)
    is_open_late = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'restaurants'
        indexes = [
            models.Index(fields=['rating']),
            models.Index(fields=['average_cost']),
        ]

    def __str__(self):
        return self.name

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorites'
        unique_together = ['user', 'restaurant']

    def __str__(self):
        return f"{self.user.username} - {self.restaurant.name}"

class SearchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='search_history')
    query = models.CharField(max_length=500)
    selected_restaurant = models.ForeignKey(Restaurant, on_delete=models.SET_NULL, null=True, blank=True)
    user_location_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    user_location_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'search_history'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.query}"

class SavedDiscovery(models.Model):
    SOURCE_CHOICES = [
        ('instagram', 'Instagram'),
        ('friend', 'Friend Recommendation'),
        ('youtube', 'YouTube'),
        ('blog', 'Blog/Article'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_discoveries')
    restaurant_name = models.CharField(max_length=200)
    area = models.CharField(max_length=200)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    google_maps_link = models.URLField(blank=True)
    image_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_discoveries'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.restaurant_name}"
