from django.urls import path
from . import views

urlpatterns = [
    path('auth/signup/', views.signup, name='signup'),
    path('auth/login/', views.user_login, name='login'),
    path('auth/logout/', views.user_logout, name='logout'),
    path('auth/status/', views.auth_status, name='auth_status'),
    
    path('restaurants/', views.list_restaurants, name='list_restaurants'),
    path('recommend/', views.recommend, name='recommend'),
    path('surprise/', views.surprise, name='surprise'),
    
    path('favorites/', views.favorites, name='favorites'),
    path('history/', views.history, name='history'),
    path('saved-discoveries/', views.saved_discoveries, name='saved_discoveries'),
    path('record-selection/', views.record_selection, name='record_selection'),
]
