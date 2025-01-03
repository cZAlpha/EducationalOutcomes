from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView # User-made view to create users
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # Prebuilt views that allow us to access JWT tokens AND refresh existing ones


# Configures overall URLs
urlpatterns = [
    # Admin
    path("admin/", admin.site.urls), # Native Django admin suite pathing
    # User Registration
    path("api/user/register/", CreateUserView.as_view(), name="register"), # Register new user path
    # API Token Stuff
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"), # Get JWT token path
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh_token"), # Refresh JWT token path
    path("api-auth/", include("rest_framework.urls")), # REST Framework prebuilt URLs
    # API App Urls.py pathing
    path("api/", include("api.urls")) # Forward requests to the API url app's urls.py file (api/urls.py)
]
