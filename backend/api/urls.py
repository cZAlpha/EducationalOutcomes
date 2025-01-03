# API App urls.py

from django.urls import path
from .views import *
from django.urls import path, re_path


urlpatterns = [
      # User object routing
   path("users/", UserListCreate.as_view(), name="user-list"), # Route that returns all users in the DB as a list
   re_path(r'^users/(?P<user_identifier>\w+)', UserDetail.as_view(), name='user-detail'),
   #path('users/<str:user_identifier>/', UserDetailView.as_view(), name='user-detail') # Route that can update, delete, or retrieve specific user instances
      # Log object routing
   path("logs/", LogListCreate.as_view(), name="log-list"), # Route that returns all logs
   path("logs/<int:pk>/", LogDetail.as_view(), name="log-detail"),  # Retrieve, update, or delete a log
]
